import { describe, expect, it } from 'vitest'
import { readTextStream, askCoach } from './coach.js'

const enc = new TextEncoder()
const stream = (chunks, failAfter = false) => {
  let i = 0
  return new ReadableStream({
    pull(c) {
      if (i < chunks.length) c.enqueue(chunks[i++])
      else if (failAfter) c.error(new Error('x'))
      else c.close()
    },
  })
}

describe('readTextStream', () => {
  it('accumulates and handles multibyte split across chunks', async () => {
    const bytes = enc.encode('Chào bạn')
    const seen = []
    const full = await readTextStream(stream([bytes.slice(0, 3), bytes.slice(3)]), (t) => seen.push(t))
    expect(full).toBe('Chào bạn')
    expect(seen.at(-1)).toBe('Chào bạn')
  })
  it('returns partial on mid-stream failure', async () => {
    expect(await readTextStream(stream([enc.encode('abc')], true))).toBe('abc')
  })
})

describe('askCoach streaming', () => {
  const msgs = [{ role: 'user', content: 'chào' }]
  const resp = (type, body) => ({ ok: true, headers: { get: () => type }, body, json: async () => body })
  it('streams text/plain', async () => {
    globalThis.fetch = async () => resp('text/plain; charset=utf-8', stream([enc.encode(' Xin '), enc.encode('chào ')]))
    const seen = []
    expect(await askCoach({ messages: msgs, onDelta: (t) => seen.push(t) })).toEqual({ reply: 'Xin chào' })
    expect(seen).toEqual([' Xin ', ' Xin chào '])
  })
  it('empty stream -> fallback', async () => {
    globalThis.fetch = async () => resp('text/plain', stream([]))
    expect(await askCoach({ messages: msgs })).toEqual({ fallback: true })
  })
  it('429 -> rateLimited fallback', async () => {
    globalThis.fetch = async () => ({ ok: false, status: 429, headers: { get: () => 'application/json' } })
    expect(await askCoach({ messages: msgs })).toEqual({ fallback: true, rateLimited: true })
  })
  it('json still works', async () => {
    globalThis.fetch = async () => ({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ crisis: true }) })
    expect(await askCoach({ messages: msgs })).toEqual({ crisis: true })
  })
})
