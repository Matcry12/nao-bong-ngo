import { detectCrisis } from './coachSafety.js'

// Reads a text/plain stream, calling onDelta(fullTextSoFar). Returns full text;
// on mid-stream failure returns what arrived so far.
export async function readTextStream(body, onDelta, onActivity) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      const t = decoder.decode(value, { stream: true })
      if (t) { full += t; onActivity?.(); onDelta?.(full) }
    }
    full += decoder.decode()
  } catch { /* keep partial */ }
  return full
}

// → { reply } | { crisis: true } | { fallback: true, rateLimited?: true }
export async function askCoach({ messages, context, image, onDelta }) {
  const last = [...messages].reverse().find((m) => m.role === 'user')
  if (last && detectCrisis(last.content)) return { crisis: true }
  const ctrl = new AbortController()
  // Covers time to first byte; once text flows, abort only after 15s with no delta.
  let timer = setTimeout(() => ctrl.abort(), image ? 30000 : 20000)
  const rearm = () => { clearTimeout(timer); timer = setTimeout(() => ctrl.abort(), 15000) }
  try {
    const r = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context, ...(image ? { image } : {}) }),
      signal: ctrl.signal,
    })
    if (r.status === 429) return { fallback: true, rateLimited: true }
    if (!r.ok) return { fallback: true }
    const type = r.headers?.get?.('content-type') || ''
    if (type.includes('text/plain') && r.body) {
      const full = (await readTextStream(r.body, onDelta, rearm)).trim()
      return full ? { reply: full } : { fallback: true }
    }
    const data = await r.json()
    if (data.crisis) return { crisis: true }
    if (typeof data.reply === 'string' && data.reply) return { reply: data.reply }
    return { fallback: true }
  } catch {
    return { fallback: true }
  } finally {
    clearTimeout(timer)
  }
}
