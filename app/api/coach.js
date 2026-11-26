// Vercel serverless proxy for the AI coach. The key only lives in process.env.
import { detectCrisis } from '../src/coachSafety.js'
import { SYSTEM_PROMPT } from './_coachPrompt.js'

const CRISIS_MARK = '[[CRISIS]]'
const MAX_MESSAGES = 12
const MAX_CHARS = 500
const BAR_KEYS = ['focus', 'patience', 'switchUrge', 'phone']

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const str = (v, n = 80) => (typeof v === 'string' ? v.slice(0, n) : '')

export function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return null
  return raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    .slice(-MAX_MESSAGES)
}

const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/
const MAX_IMAGE = 1_600_000

export function sanitizeImage(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_IMAGE) return null
  return IMAGE_RE.test(raw) ? raw : null
}

export function sanitizeContext(raw) {
  const c = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const bars = {}
  const rb = c.bars && typeof c.bars === 'object' ? c.bars : {}
  for (const k of BAR_KEYS) { const v = num(rb[k]); if (v !== null) bars[k] = Math.round(v) }
  return {
    score: num(c.score),
    level: str(c.level, 40),
    bars,
    reasons: Array.isArray(c.reasons) ? c.reasons.filter((r) => typeof r === 'string').slice(0, 3).map((r) => r.slice(0, 60)) : [],
    plan: Array.isArray(c.plan)
      ? c.plan.filter((p) => p && typeof p === 'object').slice(0, 5).map((p) => ({ title: str(p.title, 100), group: str(p.group, 30) }))
      : [],
    challengeDay: num(c.challengeDay),
  }
}

const WEEKS = ['Làm quen', 'Giữ nhịp', 'Thành thói quen']
const weekName = (d) => {
  const w = Math.min(3, Math.max(1, Math.ceil(d / 7)))
  return ` (tuần ${w}: ${WEEKS[w - 1]})`
}

export function contextText(c) {
  const lines = ['Kết quả của người chơi (ẩn danh):']
  if (c.score !== null) lines.push(`- Điểm "nổ": ${Math.round(c.score)}/100${c.level ? ` (mức ${c.level})` : ''}`)
  const names = { focus: 'Tập trung khi bị xao nhãng', patience: 'Kiên nhẫn', switchUrge: 'Muốn chuyển nội dung', phone: 'Gắn bó với điện thoại' }
  const bars = BAR_KEYS.filter((k) => k in c.bars).map((k) => `${names[k]} ${c.bars[k]}/100`)
  if (bars.length) lines.push(`- 4 chỉ số (càng cao càng "nổ"): ${bars.join('; ')}`)
  if (c.reasons.length) lines.push(`- Lý do hay lướt điện thoại: ${c.reasons.join('; ')}`)
  if (c.plan.length) lines.push(`- Kế hoạch: ${c.plan.map((p) => `${p.title}${p.group ? ` (${p.group})` : ''}`).join('; ')}`)
  if (c.challengeDay !== null) lines.push(`- Đang ở ngày ${c.challengeDay}/21 của thử thách${weekName(c.challengeDay)}`)
  return lines.join('\n')
}

// Incremental SSE parser: push(chunk) -> text deltas. Buffers partial lines.
export function createSseParser() {
  let buf = ''
  const line = (l) => {
    if (!l.startsWith('data:')) return null
    const d = l.slice(5).trim()
    if (!d || d === '[DONE]') return null
    try {
      const c = JSON.parse(d)?.choices?.[0]?.delta?.content
      return typeof c === 'string' && c ? c : null
    } catch { return null }
  }
  return {
    push(chunk) {
      buf += chunk
      const lines = buf.split('\n')
      buf = lines.pop()
      return lines.map((l) => line(l.replace(/\r$/, ''))).filter(Boolean)
    },
    flush() {
      const l = line(buf.replace(/\r$/, ''))
      buf = ''
      return l ? [l] : []
    },
  }
}

async function readBody(req) {
  const b = req.body
  if (typeof b === 'string') { try { return JSON.parse(b) } catch { return null } }
  return b && typeof b === 'object' ? b : null
}

// Best-effort in-memory rate limiter (per warm instance). Fixed windows.
export function createRateLimiter({
  now = Date.now, ipMax = 20, ipWindowMs = 600000, globalMax = 300, globalWindowMs = 3600000, maxKeys = 5000,
} = {}) {
  const ips = new Map() // ip -> { start, count }
  let g = { start: -Infinity, count: 0 }
  const prune = (t) => {
    for (const [k, v] of ips) if (t - v.start >= ipWindowMs) ips.delete(k)
    while (ips.size >= maxKeys) ips.delete(ips.keys().next().value)
  }
  return {
    allow(ip) {
      const t = now()
      if (t - g.start >= globalWindowMs) g = { start: t, count: 0 }
      if (g.count >= globalMax) return false
      let e = ips.get(ip)
      if (!e || t - e.start >= ipWindowMs) {
        if (ips.size >= maxKeys) prune(t)
        e = { start: t, count: 0 }
      }
      if (e.count >= ipMax) return false
      e.count++
      g.count++
      ips.delete(ip) // refresh insertion order so the oldest are evicted first
      ips.set(ip, e)
      return true
    },
    size: () => ips.size,
  }
}

const limiter = createRateLimiter()

function clientIp(req) {
  const h = req.headers || {}
  const xff = h['x-forwarded-for']
  const first = (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim()
  const real = h['x-real-ip']
  return first || (typeof real === 'string' && real.trim()) || 'unknown'
}

export default async function handler(req, res, rateLimiter = limiter) {
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'POST')
    return res.status(405).json({ error: 'method' })
  }
  const body = await readBody(req)
  const messages = sanitizeMessages(body?.messages)
  if (!messages || messages.length === 0) return res.status(400).json({ error: 'bad_request' })

  const last = [...messages].reverse().find((m) => m.role === 'user')
  if (last && detectCrisis(last.content)) return res.status(200).json({ crisis: true })

  if (!rateLimiter.allow(clientIp(req))) return res.status(429).json({ error: 'rate_limited' })

  const image = sanitizeImage(body?.image)
  const lastIdx = messages.map((m) => m.role).lastIndexOf('user')
  const outMessages = image && lastIdx >= 0
    ? messages.map((m, i) => (i === lastIdx
      ? { role: 'user', content: [{ type: 'text', text: m.content }, { type: 'image_url', image_url: { url: image } }] }
      : m))
    : messages

  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return res.status(503).json({ error: 'unavailable' })

  const ctrl = new AbortController()
  // Timeout covers time to first token; once text flows, allow 30s total.
  let timer = setTimeout(() => ctrl.abort(), image ? 25000 : 15000)
  let started = false
  try {
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: contextText(sanitizeContext(body?.context)) },
          ...outMessages,
        ],
        max_tokens: 350,
        temperature: 0.7,
        stream: true,
      }),
      signal: ctrl.signal,
    })
    if (!r.ok || !r.body) return res.status(503).json({ error: 'unavailable' })
    const reader = r.body.getReader()
    const crisis = () => { ctrl.abort(); reader.cancel().catch(() => {}); return res.status(200).json({ crisis: true }) }
    const decoder = new TextDecoder()
    const sse = createSseParser()
    let pending = ''
    let decided = false
    // Hold output until we can tell whether the model answered with the crisis marker.
    const emit = (text) => {
      if (!text) return
      if (!decided) {
        pending += text
        if (pending.trimStart().length < CRISIS_MARK.length) return
        decided = true
        if (pending.trimStart().startsWith(CRISIS_MARK)) return 'crisis'
        text = pending
      }
      if (!started) {
        started = true
        clearTimeout(timer)
        timer = setTimeout(() => ctrl.abort(), 30000)
        res.status(200)
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache, no-transform')
        res.flushHeaders?.()
      }
      res.write(text)
    }
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      for (const t of sse.push(decoder.decode(value, { stream: true }))) if (emit(t) === 'crisis') return crisis()
    }
    for (const t of [...sse.push(decoder.decode()), ...sse.flush()]) if (emit(t) === 'crisis') return crisis()
    if (!decided && pending.trim()) {
      decided = true
      if (pending.trimStart().startsWith(CRISIS_MARK)) return crisis()
      emit(pending)
    }
    if (!started) return res.status(503).json({ error: 'unavailable' })
    return res.end()
  } catch {
    if (started) return res.end()
    return res.status(503).json({ error: 'unavailable' })
  } finally {
    clearTimeout(timer)
  }
}
