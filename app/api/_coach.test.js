import { afterEach, describe, expect, it, vi } from 'vitest'
import handler, { sanitizeContext, sanitizeMessages, contextText } from './coach.js'

function call(req) {
  const out = { code: 200, body: null }
  const res = { setHeader() {}, status(c) { out.code = c; return this }, json(b) { out.body = b; return this } }
  return handler(req, res).then(() => out)
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); delete process.env.DEEPSEEK_API_KEY })

describe('sanitizeMessages', () => {
  it('rejects non-arrays', () => { expect(sanitizeMessages('x')).toBeNull() })
  it('keeps last 12, truncates, filters roles/types', () => {
    const raw = Array.from({ length: 20 }, (_, i) => ({ role: 'user', content: 'a'.repeat(600) + i }))
    raw.push({ role: 'system', content: 'hack' }, { role: 'user', content: 5 }, null)
    const m = sanitizeMessages(raw)
    expect(m).toHaveLength(12)
    expect(m.every((x) => x.role === 'user' && x.content.length === 500)).toBe(true)
  })
})

describe('sanitizeContext', () => {
  it('drops unknown/bad fields', () => {
    const c = sanitizeContext({ score: '9', level: 5, bars: { focus: 10, x: 1, phone: NaN }, reasons: ['a', 3], plan: [{ title: 't', group: 'g', evil: 1 }, 7], challengeDay: 3, name: 'Bob' })
    expect(c).toEqual({ score: null, level: '', bars: { focus: 10 }, reasons: ['a'], plan: [{ title: 't', group: 'g' }], challengeDay: 3 })
    expect(contextText(c)).toContain('ngày 3/21 của thử thách (tuần 1: Làm quen)')
  })
  it('handles garbage', () => { expect(sanitizeContext(null).plan).toEqual([]) })
})

describe('handler', () => {
  it('405 on GET', async () => { expect((await call({ method: 'GET' })).code).toBe(405) })
  it('400 on bad messages', async () => { expect((await call({ method: 'POST', body: { messages: 'x' } })).code).toBe(400) })
  it('crisis skips the AI', async () => {
    process.env.DEEPSEEK_API_KEY = 'k'
    const f = vi.fn(); vi.stubGlobal('fetch', f)
    const r = await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'mình muốn chết' }] } })
    expect(r).toEqual({ code: 200, body: { crisis: true } })
    expect(f).not.toHaveBeenCalled()
  })
  it('503 without key', async () => {
    const f = vi.fn(); vi.stubGlobal('fetch', f)
    const r = await call({ method: 'POST', body: JSON.stringify({ messages: [{ role: 'user', content: 'chào' }] }) })
    expect(r).toEqual({ code: 503, body: { error: 'unavailable' } })
    expect(f).not.toHaveBeenCalled()
  })
  it('returns reply and sends well-formed request', async () => {
    process.env.DEEPSEEK_API_KEY = 'secret'
    const f = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: ' Chào bạn ' } }] }) })
    vi.stubGlobal('fetch', f)
    const r = await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'chào' }], context: { score: 70 } } })
    expect(r).toEqual({ code: 200, body: { reply: 'Chào bạn' } })
    const body = JSON.parse(f.mock.calls[0][1].body)
    expect(body.messages.map((m) => m.role)).toEqual(['system', 'system', 'user'])
    expect(body.max_tokens).toBe(350)
  })
  it('503 on upstream error without leaking', async () => {
    process.env.DEEPSEEK_API_KEY = 'secret'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))
    const r = await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'chào' }] } })
    expect(r).toEqual({ code: 503, body: { error: 'unavailable' } })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('secret boom')))
    expect(JSON.stringify(await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'chào' }] } }))).not.toContain('secret')
  })
})
