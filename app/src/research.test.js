import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  CLIENT_KEY,
  CONSENT_KEY,
  HEADERS,
  getClientId,
  loadConsent,
  saveConsent,
  buildRow,
  sendRow,
  fetchSummary,
} from './research.js'

const fakeStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    _map: map,
  }
}

const throwingStorage = {
  getItem() { throw new Error('boom') },
  setItem() { throw new Error('boom') },
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getClientId', () => {
  it('returns a stored id without writing again', () => {
    const storage = fakeStorage({ [CLIENT_KEY]: 'known-id' })
    const setItem = vi.fn(storage.setItem)
    storage.setItem = setItem
    expect(getClientId(storage)).toBe('known-id')
    expect(setItem).not.toHaveBeenCalled()
  })

  it('is stable across calls and only creates the id once', () => {
    const storage = fakeStorage()
    const setItem = vi.fn(storage.setItem)
    storage.setItem = setItem

    const first = getClientId(storage)
    const second = getClientId(storage)

    expect(first).toBeTruthy()
    expect(second).toBe(first)
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(storage._map.get(CLIENT_KEY)).toBe(first)
  })

  it('still returns an id when storage throws', () => {
    const id = getClientId(throwingStorage)
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('falls back to a 16-character hex id without crypto.randomUUID', () => {
    vi.stubGlobal('crypto', undefined)
    const id = getClientId(fakeStorage())
    expect(id).toMatch(/^[0-9a-f]{16}$/)
  })
})

describe('consent', () => {
  it('defaults to no consent and empty info', () => {
    expect(loadConsent(fakeStorage())).toEqual({
      consent: false,
      info: { school: '', grade: '', gender: '' },
    })
  })

  it('round-trips saved consent and info', () => {
    const storage = fakeStorage()
    saveConsent(storage, {
      consent: true,
      info: { school: 'THCS A', grade: '8', gender: 'nữ' },
    })
    expect(loadConsent(storage)).toEqual({
      consent: true,
      info: { school: 'THCS A', grade: '8', gender: 'nữ' },
    })
  })

  it('falls back to defaults for bad JSON or bad shapes', () => {
    const storage = fakeStorage({ [CONSENT_KEY]: '{not json' })
    expect(loadConsent(storage)).toEqual({
      consent: false,
      info: { school: '', grade: '', gender: '' },
    })

    storage._map.set(CONSENT_KEY, 'null')
    expect(loadConsent(storage).consent).toBe(false)

    storage._map.set(CONSENT_KEY, JSON.stringify({ consent: 'yes', info: null }))
    expect(loadConsent(storage)).toEqual({
      consent: false,
      info: { school: '', grade: '', gender: '' },
    })
  })

  it('never throws with broken storage', () => {
    expect(() => saveConsent(throwingStorage, { consent: true, info: {} })).not.toThrow()
    expect(loadConsent(throwingStorage).consent).toBe(false)
  })
})

describe('buildRow', () => {
  const now = new Date('2026-03-01T10:20:30.000Z')

  it('builds an object with exactly the HEADERS keys in order', () => {
    const row = buildRow({
      clientId: 'c1',
      day: 1,
      info: { school: 'A', grade: '8', gender: 'nam' },
      total: 70,
      level: 'cao',
      bars: { focus: 4, patience: 3, switchUrge: 2, phone: 1 },
      reasons: ['mạng xã hội', 'game'],
      plan: ['để điện thoại xa', 'học 25 phút'],
      now,
    })

    expect(Object.keys(row)).toEqual(HEADERS)
    expect(row).toEqual({
      timestamp: '2026-03-01T10:20:30.000Z',
      clientId: 'c1',
      day: 1,
      school: 'A',
      grade: '8',
      gender: 'nam',
      score: 70,
      level: 'cao',
      focus: 4,
      patience: 3,
      switchUrge: 2,
      phone: 1,
      reasons: 'mạng xã hội; game',
      plan: 'để điện thoại xa; học 25 phút',
    })
  })

  it('trims and caps text fields, and uses empty strings for missing info', () => {
    const longSchool = '  ' + 'a'.repeat(80) + '  '
    const row = buildRow({
      clientId: 'c2',
      day: 7,
      info: { school: longSchool, grade: '  9  ', gender: 3 },
      total: 0,
      level: 'thấp',
      now,
    })

    expect(row.school).toBe('a'.repeat(60))
    expect(row.grade).toBe('9')
    expect(row.gender).toBe('3')
    expect(row.reasons).toBe('')
    expect(row.plan).toBe('')

    const blank = buildRow({ clientId: 'c3', day: 1, total: 1, level: 'x', now })
    expect(blank.school).toBe('')
    expect(blank.grade).toBe('')
    expect(blank.gender).toBe('')
  })

  it('keeps zero bar values and nulls missing ones', () => {
    const row = buildRow({
      clientId: 'c4',
      day: 1,
      total: 10,
      level: 'x',
      bars: { focus: 0, patience: 2 },
      now,
    })

    expect(row.focus).toBe(0)
    expect(row.patience).toBe(2)
    expect(row.switchUrge).toBeNull()
    expect(row.phone).toBeNull()
  })
})

describe('sendRow', () => {
  const row = { clientId: 'c1', day: 1 }

  it('returns false without a url and never calls fetch', async () => {
    const fetchImpl = vi.fn()
    await expect(sendRow('', row, fetchImpl)).resolves.toBe(false)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('posts the row with the expected options', async () => {
    const calls = []
    const fetchImpl = async (url, options) => {
      calls.push({ url, options })
      return {}
    }

    await expect(sendRow('https://example.com/exec', row, fetchImpl)).resolves.toBe(true)

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('https://example.com/exec')
    expect(calls[0].options).toEqual({
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(row),
    })
  })

  it('returns false when fetch throws', async () => {
    const fetchImpl = async () => {
      throw new Error('offline')
    }
    await expect(sendRow('https://example.com/exec', row, fetchImpl)).resolves.toBe(false)
  })
})

describe('fetchSummary', () => {
  it('returns null without a url', async () => {
    const fetchImpl = vi.fn()
    await expect(fetchSummary('', fetchImpl)).resolves.toBeNull()
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('appends the summary query string correctly', async () => {
    const urls = []
    const fetchImpl = async (url) => {
      urls.push(url)
      return { json: async () => ({ count: 2 }) }
    }

    await expect(fetchSummary('https://example.com/exec', fetchImpl)).resolves.toEqual({ count: 2 })
    await expect(fetchSummary('https://example.com/exec?x=1', fetchImpl)).resolves.toEqual({ count: 2 })

    expect(urls).toEqual([
      'https://example.com/exec?summary=1',
      'https://example.com/exec?x=1&summary=1',
    ])
  })

  it('returns null for payloads without a numeric count', async () => {
    const respond = (payload) => async () => ({ json: async () => payload })

    await expect(fetchSummary('https://x', respond({ count: '3' }))).resolves.toBeNull()
    await expect(fetchSummary('https://x', respond({}))).resolves.toBeNull()
    await expect(fetchSummary('https://x', respond(null))).resolves.toBeNull()
  })

  it('returns null when fetch or parsing fails', async () => {
    const throwing = async () => {
      throw new Error('offline')
    }
    await expect(fetchSummary('https://x', throwing)).resolves.toBeNull()

    const badJson = async () => ({
      json: async () => {
        throw new Error('bad json')
      },
    })
    await expect(fetchSummary('https://x', badJson)).resolves.toBeNull()
  })
})
