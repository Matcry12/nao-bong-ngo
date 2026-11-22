import { describe, it, expect } from 'vitest'
import {
  normalizeVi,
  detectCrisis,
  createLimiter,
  ACCENTED_CRISIS,
  PLAIN_CRISIS,
} from './coachSafety.js'

function memoryStorage(initial) {
  const map = new Map(Object.entries(initial || {}))
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null
    },
    setItem(key, value) {
      map.set(key, String(value))
    },
    removeItem(key) {
      map.delete(key)
    },
    map,
  }
}

describe('normalizeVi', () => {
  it('lowercases, strips diacritics, maps đ -> d and collapses whitespace', () => {
    expect(normalizeVi('Đường ĐI  Học ')).toBe('duong di hoc')
  })

  it('handles decomposed (NFD) input', () => {
    expect(normalizeVi('tự tử')).toBe('tu tu')
  })

  it('is safe for empty and non-string input', () => {
    expect(normalizeVi('')).toBe('')
    expect(normalizeVi(undefined)).toBe('')
    expect(normalizeVi(null)).toBe('')
  })
})

describe('crisis phrase lists', () => {
  it('does not contain the ambiguous unaccented "tu tu"', () => {
    expect(PLAIN_CRISIS).not.toContain('tu tu')
  })

  it('exposes the accented phrases', () => {
    expect(ACCENTED_CRISIS).toContain('tự tử')
    expect(ACCENTED_CRISIS).toContain('muốn chết')
  })
})

describe('detectCrisis', () => {
  it.each([
    'mình muốn chết quá',
    'Tôi muốn TỰ TỬ',
    'toi muon chet',
    'khong muon song nua',
    'I want to die',
    'toi muon tu tu',
    'chet di cho xong',
    'muốn biến mất',
  ])('flags %j', (text) => {
    expect(detectCrisis(text)).toBe(true)
  })

  it.each([
    'ko muốn sống nữa',
    'k muon song nua',
    'hok mun song',
  ])('flags teen shorthand %j', (text) => {
    expect(detectCrisis(text)).toBe(true)
  })

  it.each([
    'từ từ thôi',
    'tu tu thoi',
    'đi từ từ',
    'học bài chán quá',
    'điện thoại',
    'ko muốn học',
    'k muon di hoc',
    '',
  ])('does not flag %j', (text) => {
    expect(detectCrisis(text)).toBe(false)
  })

  it('does not flag undefined', () => {
    expect(detectCrisis(undefined)).toBe(false)
  })

  it('flags plain phrases with punctuation boundaries', () => {
    expect(detectCrisis('nói thật, toi muon chet.')).toBe(true)
    expect(detectCrisis('suicide…')).toBe(true)
  })

  it('does not flag a plain phrase embedded inside a longer word', () => {
    expect(detectCrisis('xsuicidex')).toBe(false)
  })
})

describe('createLimiter', () => {
  it('consumes up to the limit, then returns false without incrementing', () => {
    const storage = memoryStorage()
    const limiter = createLimiter({ storage, limit: 3 })
    expect(limiter.used()).toBe(0)
    expect(limiter.remaining()).toBe(3)
    expect(limiter.consume()).toBe(true)
    expect(limiter.consume()).toBe(true)
    expect(limiter.consume()).toBe(true)
    expect(limiter.consume()).toBe(false)
    expect(limiter.used()).toBe(3)
    expect(limiter.remaining()).toBe(0)
  })

  it('tracks remaining correctly for the default limit', () => {
    const storage = memoryStorage()
    const limiter = createLimiter({ storage })
    expect(limiter.remaining()).toBe(20)
    limiter.consume()
    expect(limiter.remaining()).toBe(19)
  })

  it('persists counts in storage under the local-date key', () => {
    const storage = memoryStorage()
    const now = () => new Date(2026, 0, 5, 23, 59)
    const limiter = createLimiter({ storage, limit: 5, now })
    limiter.consume()
    expect(storage.getItem('coach-count:2026-01-05')).toBe('1')
    const again = createLimiter({ storage, limit: 5, now })
    expect(again.used()).toBe(1)
  })

  it('resets on a new date', () => {
    const storage = memoryStorage()
    let day = new Date(2026, 0, 5, 23, 59)
    const limiter = createLimiter({ storage, limit: 2, now: () => day })
    expect(limiter.consume()).toBe(true)
    expect(limiter.consume()).toBe(true)
    expect(limiter.consume()).toBe(false)
    day = new Date(2026, 0, 6, 0, 1)
    expect(limiter.used()).toBe(0)
    expect(limiter.remaining()).toBe(2)
    expect(limiter.consume()).toBe(true)
    expect(storage.getItem('coach-count:2026-01-06')).toBe('1')
  })

  it('treats a throwing getItem as zero used', () => {
    const storage = {
      getItem() {
        throw new Error('boom')
      },
      setItem() {},
    }
    const limiter = createLimiter({ storage, limit: 2 })
    expect(limiter.used()).toBe(0)
    expect(limiter.remaining()).toBe(2)
    expect(limiter.consume()).toBe(true)
    expect(limiter.used()).toBe(1)
  })

  it('does not crash when setItem throws', () => {
    const storage = {
      getItem() {
        return null
      },
      setItem() {
        throw new Error('quota')
      },
    }
    const limiter = createLimiter({ storage, limit: 2 })
    expect(() => limiter.consume()).not.toThrow()
    expect(limiter.consume()).toBe(true)
    expect(limiter.consume()).toBe(false)
  })

  it('ignores garbage stored values', () => {
    const storage = memoryStorage({ 'coach-count:2026-01-05': 'not-a-number' })
    const limiter = createLimiter({ storage, now: () => new Date(2026, 0, 5) })
    expect(limiter.used()).toBe(0)
  })
})
