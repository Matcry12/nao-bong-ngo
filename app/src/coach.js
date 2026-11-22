import { detectCrisis } from './coachSafety.js'

// → { reply } | { crisis: true } | { fallback: true }
export async function askCoach({ messages, context }) {
  const last = [...messages].reverse().find((m) => m.role === 'user')
  if (last && detectCrisis(last.content)) return { crisis: true }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  try {
    const r = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
      signal: ctrl.signal,
    })
    if (!r.ok) return { fallback: true }
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
