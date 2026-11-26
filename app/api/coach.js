// Vercel serverless proxy for the AI coach. The key only lives in process.env.
import { detectCrisis } from '../src/coachSafety.js'
import { SYSTEM_PROMPT } from './_coachPrompt.js'

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

async function readBody(req) {
  const b = req.body
  if (typeof b === 'string') { try { return JSON.parse(b) } catch { return null } }
  return b && typeof b === 'object' ? b : null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'POST')
    return res.status(405).json({ error: 'method' })
  }
  const body = await readBody(req)
  const messages = sanitizeMessages(body?.messages)
  if (!messages || messages.length === 0) return res.status(400).json({ error: 'bad_request' })

  const last = [...messages].reverse().find((m) => m.role === 'user')
  if (last && detectCrisis(last.content)) return res.status(200).json({ crisis: true })

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
  const timer = setTimeout(() => ctrl.abort(), image ? 25000 : 15000)
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
      }),
      signal: ctrl.signal,
    })
    if (!r.ok) return res.status(503).json({ error: 'unavailable' })
    const data = await r.json()
    const reply = data?.choices?.[0]?.message?.content
    if (typeof reply !== 'string' || !reply.trim()) return res.status(503).json({ error: 'unavailable' })
    return res.status(200).json({ reply: reply.trim() })
  } catch {
    return res.status(503).json({ error: 'unavailable' })
  } finally {
    clearTimeout(timer)
  }
}
