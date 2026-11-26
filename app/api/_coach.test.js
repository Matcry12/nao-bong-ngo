import { afterEach, describe, expect, it, vi } from 'vitest'
import handler, { createRateLimiter, sanitizeContext, sanitizeMessages, sanitizeImage, contextText } from './coach.js'

function call(req) {
  const out = { code: 200, body: null, headers: {}, writes: [], ended: false }
  const res = {
    setHeader(k, v) { out.headers[k] = v },
    status(c) { out.code = c; return this },
    json(b) { out.body = b; return this },
    write(t) { out.writes.push(t); return true },
    end() { out.ended = true },
  }
  return handler(req, res).then(() => out)
}

const enc = new TextEncoder()
const sse = (...chunks) => ({
  ok: true,
  body: new ReadableStream({
    start(c) { for (const x of chunks) c.enqueue(enc.encode(x)); c.close() },
  }),
})
const delta = (content, extra = {}) => `data: ${JSON.stringify({ choices: [{ delta: { content, ...extra } }] })}\n\n`
const okStream = (text = 'ok') => sse(delta(text), 'data: [DONE]\n\n')

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

describe('sanitizeImage', () => {
  it('accepts valid jpeg', () => { const u = 'data:image/jpeg;base64,/9j/4AAQ=='; expect(sanitizeImage(u)).toBe(u) })
  it('rejects wrong mime', () => { expect(sanitizeImage('data:image/gif;base64,AAAA')).toBeNull() })
  it('rejects non-base64', () => { expect(sanitizeImage('data:image/png;base64,<script>')).toBeNull() })
  it('rejects oversize', () => { expect(sanitizeImage('data:image/png;base64,' + 'A'.repeat(1_600_000))).toBeNull() })
  it('rejects non-strings', () => { expect(sanitizeImage(5)).toBeNull(); expect(sanitizeImage(null)).toBeNull() })
})

describe('createRateLimiter', () => {
  it('limits per IP and expires with the clock', () => {
    let t = 0
    const l = createRateLimiter({ now: () => t, ipMax: 2, ipWindowMs: 1000 })
    expect([l.allow('a'), l.allow('a'), l.allow('a'), l.allow('b')]).toEqual([true, true, false, true])
    t = 1000
    expect(l.allow('a')).toBe(true)
  })
  it('enforces global cap and resets', () => {
    let t = 0
    const l = createRateLimiter({ now: () => t, globalMax: 3, globalWindowMs: 5000 })
    expect(['a', 'b', 'c', 'd'].map((i) => l.allow(i))).toEqual([true, true, true, false])
    t = 5000
    expect(l.allow('e')).toBe(true)
  })
  it('caps stored keys', () => {
    const l = createRateLimiter({ maxKeys: 10, globalMax: 1e9 })
    for (let i = 0; i < 100; i++) l.allow('ip' + i)
    expect(l.size()).toBeLessThanOrEqual(10)
  })
})

describe('handler', () => {
  const user = (content) => ({ method: 'POST', headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, body: { messages: [{ role: 'user', content }] } })
  const lim = (ok) => ({ allow: vi.fn(() => ok) })
  const run = (req, l) => {
    const out = { code: 200, body: null, headers: {}, writes: [], ended: false }
    const res = { setHeader(k, v) { out.headers[k] = v }, status(c) { out.code = c; return this }, json(b) { out.body = b; return this }, write(t) { out.writes.push(t) }, end() { out.ended = true } }
    return handler(req, res, l).then(() => out)
  }
  it('429 when limited, using first x-forwarded-for IP', async () => {
    process.env.DEEPSEEK_API_KEY = 'k'
    const f = vi.fn(); vi.stubGlobal('fetch', f)
    const l = lim(false)
    expect(await run(user('chào'), l)).toMatchObject({ code: 429, body: { error: 'rate_limited' } })
    expect(l.allow).toHaveBeenCalledWith('1.2.3.4')
    expect(f).not.toHaveBeenCalled()
  })
  it('crisis bypasses the limiter', async () => {
    process.env.DEEPSEEK_API_KEY = 'k'
    const l = lim(false)
    expect(await run(user('mình muốn chết'), l)).toMatchObject({ code: 200, body: { crisis: true } })
    expect(l.allow).not.toHaveBeenCalled()
  })
  it('[[CRISIS]] marker split across chunks gives JSON crisis, nothing written', async () => {
    process.env.DEEPSEEK_API_KEY = 'k'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sse(delta('[[CRI'), delta('SIS]]'), delta(' thêm'))))
    const out = await run(user('chào'), lim(true))
    expect(out).toMatchObject({ code: 200, body: { crisis: true }, writes: [] })
  })
  it('marker as whole short response is caught', async () => {
    process.env.DEEPSEEK_API_KEY = 'k'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sse(delta(' [[CRISIS]]\n'))))
    expect((await run(user('chào'), lim(true))).body).toEqual({ crisis: true })
  })
  it('short non-marker response is flushed at stream end', async () => {
    process.env.DEEPSEEK_API_KEY = 'k'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sse(delta('Chào!'))))
    expect(await run(user('chào'), lim(true))).toMatchObject({ code: 200, writes: ['Chào!'], ended: true })
  })
  it('marker mentioned later is not caught', async () => {
    process.env.DEEPSEEK_API_KEY = 'k'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sse(delta('Mình hiểu bạn. '), delta('[[CRISIS]] là mã'))))
    const out = await run(user('chào'), lim(true))
    expect(out.body).toBeNull()
    expect(out.writes.join('')).toBe('Mình hiểu bạn. [[CRISIS]] là mã')
  })
  it('405 on GET', async () => { expect((await call({ method: 'GET' })).code).toBe(405) })
  it('400 on bad messages', async () => { expect((await call({ method: 'POST', body: { messages: 'x' } })).code).toBe(400) })
  it('crisis skips the AI', async () => {
    process.env.DEEPSEEK_API_KEY = 'k'
    const f = vi.fn(); vi.stubGlobal('fetch', f)
    const r = await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'mình muốn chết' }] } })
    expect(r).toMatchObject({ code: 200, body: { crisis: true }, writes: [] })
    expect(f).not.toHaveBeenCalled()
  })
  it('503 without key', async () => {
    const f = vi.fn(); vi.stubGlobal('fetch', f)
    const r = await call({ method: 'POST', body: JSON.stringify({ messages: [{ role: 'user', content: 'chào' }] }) })
    expect(r).toMatchObject({ code: 503, body: { error: 'unavailable' } })
    expect(f).not.toHaveBeenCalled()
  })
  it('streams deltas, handles split lines, ignores [DONE] and reasoning', async () => {
    process.env.DEEPSEEK_API_KEY = 'secret'
    const a = delta('Chào'), b = delta(' bạn'), r = delta(null, { reasoning_content: 'hmm' })
    const cut = b.indexOf('"content"') + 5
    const f = vi.fn().mockResolvedValue(sse(a, r, b.slice(0, cut), b.slice(cut), delta('!'), 'data: [DONE]\n\n'))
    vi.stubGlobal('fetch', f)
    const out = await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'chào' }], context: { score: 70 } } })
    expect(out.code).toBe(200)
    expect(out.headers['Content-Type']).toBe('text/plain; charset=utf-8')
    expect(out.headers['Cache-Control']).toBe('no-cache, no-transform')
    expect(out.writes.join('')).toBe('Chào bạn!')
    expect(out.writes.length).toBeGreaterThan(0)
    expect(out.ended).toBe(true)
    const body = JSON.parse(f.mock.calls[0][1].body)
    expect(body.messages.map((m) => m.role)).toEqual(['system', 'system', 'user'])
    expect(body.max_tokens).toBe(350)
    expect(body.stream).toBe(true)
  })
  it('does not leak reasoning_content', async () => {
    process.env.DEEPSEEK_API_KEY = 'secret'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sse(`data: ${JSON.stringify({ choices: [{ delta: { reasoning_content: 'secret thought' } }] })}\n\n`, delta('xin chào'))))
    const out = await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'chào' }] } })
    expect(out.writes.join('')).toBe('xin chào')
  })
  it('503 JSON on empty stream', async () => {
    process.env.DEEPSEEK_API_KEY = 'secret'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sse('data: [DONE]\n\n')))
    const out = await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'chào' }] } })
    expect(out).toMatchObject({ code: 503, body: { error: 'unavailable' }, writes: [] })
  })
  it('503 JSON when upstream has no body', async () => {
    process.env.DEEPSEEK_API_KEY = 'secret'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: null }))
    const out = await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'chào' }] } })
    expect(out).toMatchObject({ code: 503, body: { error: 'unavailable' } })
  })
  it('ends quietly when the stream errors after some text', async () => {
    process.env.DEEPSEEK_API_KEY = 'secret'
    let n = 0
    const body = new ReadableStream({
      pull(c) { if (n++ === 0) c.enqueue(enc.encode(delta('một hai ba bốn'))); else c.error(new Error('boom')) },
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body }))
    const out = await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'chào' }] } })
    expect(out).toMatchObject({ code: 200, writes: ['một hai ba bốn'], ended: true })
  })
  it('503 on upstream error without leaking', async () => {
    process.env.DEEPSEEK_API_KEY = 'secret'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))
    const r = await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'chào' }] } })
    expect(r).toMatchObject({ code: 503, body: { error: 'unavailable' } })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('secret boom')))
    expect(JSON.stringify(await call({ method: 'POST', body: { messages: [{ role: 'user', content: 'chào' }] } }))).not.toContain('secret')
  })
  it('builds multimodal content for the last user message only', async () => {
    process.env.DEEPSEEK_API_KEY = 'secret'
    const f = vi.fn().mockImplementation(async () => okStream())
    vi.stubGlobal('fetch', f)
    const image = 'data:image/jpeg;base64,/9j/4AAQ=='
    await call({ method: 'POST', body: { image, messages: [{ role: 'user', content: 'một' }, { role: 'assistant', content: 'hai' }, { role: 'user', content: 'ba' }] } })
    const m = JSON.parse(f.mock.calls[0][1].body).messages
    expect(m[2].content).toBe('một')
    expect(m[4].content).toEqual([{ type: 'text', text: 'ba' }, { type: 'image_url', image_url: { url: image } }])
    expect(m[3].content).toBe('hai')
  })
  it('drops a bad image silently', async () => {
    process.env.DEEPSEEK_API_KEY = 'secret'
    const f = vi.fn().mockImplementation(async () => okStream())
    vi.stubGlobal('fetch', f)
    await call({ method: 'POST', body: { image: 'data:text/html;base64,AAAA', messages: [{ role: 'user', content: 'ba' }] } })
    expect(JSON.parse(f.mock.calls[0][1].body).messages[2].content).toBe('ba')
  })
})
