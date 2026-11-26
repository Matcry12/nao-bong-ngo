import { describe, it, expect } from 'vitest'
import {
  STORAGE_KEY,
  toDateKey,
  daysBetween,
  createChallenge,
  tasksFor,
  nextDay,
  canPlay,
  completeDay,
  recordRetest,
  compare,
  loadChallenge,
  saveChallenge,
  clearChallenge,
  LEGACY_KEY,
} from './challenge.js'

const addDays = (key, offset) => {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

const fakeStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    _map: map,
  }
}

const throwingStorage = {
  getItem() { throw new Error('boom') },
  setItem() { throw new Error('boom') },
  removeItem() { throw new Error('boom') },
}

const makeState = (today = '2026-03-01') =>
  createChallenge({
    plan: ['a', 'b', 'c'],
    top: ['habit', 'fomo'],
    score: 70,
    bars: { focus: 3, patience: 2, switchUrge: 5, phone: 4 },
    today,
  })

const completeDays = (state, count, start = state.startDate, opts) => {
  let next = state
  for (let day = 1; day <= count; day += 1) {
    next = completeDay(next, day, addDays(start, day - 1), opts)
  }
  return next
}

describe('toDateKey', () => {
  it('formats a date using local calendar parts', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(toDateKey(new Date(2026, 10, 22, 0, 0))).toBe('2026-11-22')
  })
  it('defaults to today and always pads', () => {
    expect(toDateKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('daysBetween', () => {
  it('counts whole calendar days', () => {
    expect(daysBetween('2026-03-01', '2026-03-01')).toBe(0)
    expect(daysBetween('2026-03-01', '2026-03-04')).toBe(3)
    expect(daysBetween('2026-03-04', '2026-03-01')).toBe(-3)
  })
  it('works across month and year ends', () => {
    expect(daysBetween('2026-09-30', '2026-10-02')).toBe(2)
    expect(daysBetween('2026-12-30', '2027-01-02')).toBe(3)
    expect(daysBetween('2027-12-31', '2028-01-01')).toBe(1)
  })
  it('handles February in a non-leap year', () => {
    expect(daysBetween('2026-02-27', '2026-03-01')).toBe(2)
  })
})

describe('createChallenge', () => {
  it('builds a fresh state anchored at today', () => {
    const state = makeState('2026-03-01')
    expect(state).toEqual({
      version: 2,
      startDate: '2026-03-01',
      plan: ['a', 'b', 'c'],
      top: ['habit', 'fomo'],
      day1: { score: 70, bars: { focus: 3, patience: 2, switchUrge: 5, phone: 4 } },
      done: [],
      final: null,
    })
    expect(nextDay(state)).toBe(1)
  })
})

describe('tasksFor', () => {
  it('cycles plan ids across 20 days and picks the line by week', () => {
    const sol = { a: { tasks: ['A1', 'A2', 'A3'] }, b: { tasks: ['B1', 'B2', 'B3'] } }
    const tasks = tasksFor(['a', 'b', 'c'], sol)
    expect(tasks).toHaveLength(20)
    expect(tasks.map((task) => task.day)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    expect(tasks.map((task) => task.week)).toEqual([...Array(7).fill(1), ...Array(7).fill(2), ...Array(6).fill(3)])
    expect(tasks.slice(0, 6).map((task) => task.solutionId)).toEqual(['a', 'b', 'c', 'a', 'b', 'c'])
    expect(tasks[0].text).toBe('A1')
    expect(tasks[7].text).toBe('B2') // day 8: week 2, solution index 7 % 3 = 1
    expect(tasks[19].text).toBe('B3') // day 20: week 3, solution index 19 % 3 = 1
    expect(tasks[2].text).toBe('')
  })
  it('is safe with empty inputs', () => {
    const tasks = tasksFor(undefined, undefined)
    expect(tasks).toHaveLength(20)
    expect(tasks.every((task) => task.text === '')).toBe(true)
  })
})

describe('SOLUTIONS content', () => {
  it('has three week lines per solution', async () => {
    const { SOLUTIONS } = await import('./content.js')
    for (const [id, sol] of Object.entries(SOLUTIONS)) {
      expect(sol.tasks, id).toHaveLength(3)
      sol.tasks.forEach((t) => expect(t.length).toBeGreaterThan(10))
    }
  })
})

describe('canPlay', () => {
  it('allows the first day', () => {
    expect(canPlay(makeState(), '2026-03-01')).toEqual({ ok: true, reason: 'ok' })
  })
  it('blocks a second session on the same day', () => {
    const state = completeDays(makeState(), 1)
    expect(canPlay(state, '2026-03-01')).toEqual({ ok: false, reason: 'tomorrow' })
    expect(canPlay(state, '2026-03-01', { allowSameDay: true })).toEqual({ ok: true, reason: 'ok' })
  })
  it('does not penalise skipping a calendar day', () => {
    const state = completeDays(makeState(), 1)
    expect(canPlay(state, addDays(state.startDate, 5))).toEqual({ ok: true, reason: 'ok' })
  })
  it('requires the last task on an earlier date for day 21', () => {
    const state = completeDays(makeState(), 20)
    expect(nextDay(state)).toBe(21)
    expect(canPlay(state, '2026-03-20')).toEqual({ ok: false, reason: 'tomorrow' })
    expect(canPlay(state, '2026-03-20', { allowSameDay: true })).toEqual({ ok: true, reason: 'ok' })
    expect(canPlay(state, '2026-03-21')).toEqual({ ok: true, reason: 'ok' })
  })
  it('reports finished once day 21 is recorded', () => {
    let state = completeDays(makeState(), 20)
    state = recordRetest(state, { score: 50, bars: {} }, '2026-03-21')
    expect(canPlay(state, '2026-03-20')).toEqual({ ok: false, reason: 'finished' })
  })
})

describe('completeDay', () => {
  it('walks all 21 days on consecutive dates', () => {
    let state = makeState('2026-03-01')
    const first = state

    for (let day = 1; day <= 20; day += 1) {
      const today = addDays(state.startDate, day - 1)
      expect(nextDay(state)).toBe(day)
      expect(canPlay(state, today)).toEqual({ ok: true, reason: 'ok' })
      const before = state
      state = completeDay(state, day, today)
      expect(state).not.toBe(before)
      expect(state.done).toHaveLength(day)
      expect(state.done[day - 1]).toEqual({ day, date: today })
    }

    expect(first.done).toEqual([])
    expect(nextDay(state)).toBe(21)
    expect(canPlay(state, '2026-03-21')).toEqual({ ok: true, reason: 'ok' })

    state = recordRetest(
      state,
      { score: 55, bars: { focus: 4, patience: 3, switchUrge: 2, phone: 1 } },
      '2026-03-21',
    )
    expect(state.final).toEqual({
      score: 55,
      bars: { focus: 4, patience: 3, switchUrge: 2, phone: 1 },
      date: '2026-03-21',
    })
    expect(nextDay(state)).toBeNull()
    expect(canPlay(state, '2026-03-22')).toEqual({ ok: false, reason: 'finished' })
  })

  it('ignores the wrong day number', () => {
    const state = makeState()
    expect(completeDay(state, 2, '2026-03-01')).toBe(state)
    expect(completeDay(state, 21, '2026-03-01')).toBe(state)

    const afterFirst = completeDay(state, 1, '2026-03-01')
    expect(completeDay(afterFirst, 1, '2026-03-02')).toBe(afterFirst)
    expect(completeDay(afterFirst, 3, '2026-03-02')).toBe(afterFirst)
  })

  it('ignores a same-day attempt unless allowSameDay is set', () => {
    const state = completeDays(makeState(), 1)
    expect(completeDay(state, 2, '2026-03-01')).toBe(state)
    const next = completeDay(state, 2, '2026-03-01', { allowSameDay: true })
    expect(next.done).toHaveLength(2)
    expect(next.done[1]).toEqual({ day: 2, date: '2026-03-01' })
  })

  it('allows skipping calendar days', () => {
    const state = completeDays(makeState(), 1)
    const next = completeDay(state, 2, '2026-03-20')
    expect(next.done).toHaveLength(2)
    expect(next.done[1]).toEqual({ day: 2, date: '2026-03-20' })
  })

  it('does not mutate the input state', () => {
    const state = makeState()
    const snapshot = JSON.parse(JSON.stringify(state))
    completeDay(state, 1, '2026-03-01')
    expect(state).toEqual(snapshot)
  })
})

describe('recordRetest', () => {
  it('does nothing before the twentieth task is done', () => {
    const state = completeDays(makeState(), 19)
    expect(nextDay(state)).toBe(20)
    expect(recordRetest(state, { score: 60, bars: {} }, '2026-03-20')).toBe(state)
  })
  it('records day 21 only once', () => {
    const state = completeDays(makeState(), 20)
    const withRetest = recordRetest(state, { score: 60, bars: { focus: 1 } }, '2026-03-21')
    expect(withRetest).not.toBe(state)
    expect(withRetest.final).toEqual({ score: 60, bars: { focus: 1 }, date: '2026-03-21' })
    expect(recordRetest(withRetest, { score: 40, bars: {} }, '2026-03-22')).toBe(withRetest)
  })
  it('is blocked on the same day as task twenty without allowSameDay', () => {
    const state = completeDays(makeState(), 20)
    expect(recordRetest(state, { score: 60, bars: {} }, '2026-03-20')).toBe(state)
    const sameDay = recordRetest(state, { score: 60, bars: {} }, '2026-03-20', { allowSameDay: true })
    expect(sameDay.final.date).toBe('2026-03-20')
  })
})

describe('compare', () => {
  it('is null before the retest', () => {
    expect(compare(makeState())).toBeNull()
  })
  it('reports before, after, delta and bar gains', () => {
    let state = completeDays(makeState(), 20)
    state = recordRetest(
      state,
      { score: 55, bars: { focus: 2, patience: 2, switchUrge: 3, phone: 1 } },
      '2026-03-21',
    )
    expect(compare(state)).toEqual({
      before: 70,
      after: 55,
      delta: 15,
      improved: true,
      bars: { focus: 1, patience: 0, switchUrge: 2, phone: 3 },
    })
  })
  it('does not call a regression an improvement', () => {
    let state = completeDays(makeState(), 20)
    state = recordRetest(
      state,
      { score: 90, bars: { focus: 9, patience: 9, switchUrge: 9, phone: 9 } },
      '2026-03-21',
    )
    const result = compare(state)
    expect(result.delta).toBe(-20)
    expect(result.improved).toBe(false)
    expect(result.bars.focus).toBe(-6)
  })
})

describe('storage', () => {
  it('round-trips through a fake storage', () => {
    const storage = fakeStorage()
    const state = completeDays(makeState(), 2)

    expect(loadChallenge(storage)).toBeNull()
    expect(saveChallenge(storage, state)).toBe(true)
    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify(state))
    expect(loadChallenge(storage)).toEqual(state)
  })
  it('clears the saved challenge', () => {
    const storage = fakeStorage()
    saveChallenge(storage, makeState())
    clearChallenge(storage)
    expect(loadChallenge(storage)).toBeNull()
  })
  it('returns null on corrupted JSON', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{not json' })
    expect(loadChallenge(storage)).toBeNull()
  })
  it('returns null on a wrong version or missing fields', () => {
    const state = makeState()
    expect(loadChallenge(fakeStorage({ [STORAGE_KEY]: JSON.stringify({ ...state, version: 3 }) }))).toBeNull()
    expect(loadChallenge(fakeStorage({ [STORAGE_KEY]: JSON.stringify({ version: 1 }) }))).toBeNull()
    const { day1, ...noDay1 } = state
    expect(day1).toBeTruthy()
    expect(loadChallenge(fakeStorage({ [STORAGE_KEY]: JSON.stringify(noDay1) }))).toBeNull()
  })
  it('never throws with a throwing storage', () => {
    expect(() => loadChallenge(throwingStorage)).not.toThrow()
    expect(loadChallenge(throwingStorage)).toBeNull()
    expect(() => saveChallenge(throwingStorage, makeState())).not.toThrow()
    expect(() => clearChallenge(throwingStorage)).not.toThrow()
  })
  it('never throws with a missing storage', () => {
    expect(loadChallenge(null)).toBeNull()
    expect(() => saveChallenge(null, makeState())).not.toThrow()
    expect(() => clearChallenge(undefined)).not.toThrow()
  })
})


import { streakAtRisk } from './challenge.js'
describe('streakAtRisk', () => {
  const base = { startDate: '2026-11-01', done: [] }
  it('same or next day is fine', () => {
    expect(streakAtRisk(base, '2026-11-01')).toBe(false)
    expect(streakAtRisk(base, '2026-11-02')).toBe(false)
  })
  it('skipped a day is at risk', () => {
    expect(streakAtRisk(base, '2026-11-03')).toBe(true)
    expect(streakAtRisk({ ...base, done: [{ day: 1, date: '2026-11-05' }] }, '2026-11-07')).toBe(true)
    expect(streakAtRisk({ ...base, done: [{ day: 1, date: '2026-11-05' }] }, '2026-11-06')).toBe(false)
  })
})

describe('v1 migration', () => {
  const v1 = (extra = {}) => ({
    version: 1,
    startDate: '2026-03-01',
    plan: ['a', 'b'],
    top: ['habit'],
    day1: { score: 70, bars: { focus: 3 } },
    done: [{ day: 1, date: '2026-03-01' }, { day: 2, date: '2026-03-02' }],
    day7: null,
    ...extra,
  })
  it('moves an in-progress v1 save to v2 and removes v1', () => {
    const storage = fakeStorage({ [LEGACY_KEY]: JSON.stringify(v1()) })
    const state = loadChallenge(storage)
    expect(state.version).toBe(2)
    expect(state.final).toBeNull()
    expect(state.done).toHaveLength(2)
    expect(state.plan).toEqual(['a', 'b'])
    expect(nextDay(state)).toBe(3)
    expect(storage.getItem(LEGACY_KEY)).toBeNull()
    expect(JSON.parse(storage.getItem(STORAGE_KEY))).toEqual(state)
  })
  it('keeps a finished v1 player finished', () => {
    const day7 = { score: 50, bars: { focus: 2 }, date: '2026-03-07' }
    const done = Array.from({ length: 6 }, (_, i) => ({ day: i + 1, date: '2026-03-0' + (i + 1) }))
    const storage = fakeStorage({ [LEGACY_KEY]: JSON.stringify(v1({ done, day7 })) })
    const state = loadChallenge(storage)
    expect(state.final).toEqual(day7)
    expect(nextDay(state)).toBeNull()
    expect(compare(state).after).toBe(50)
  })
  it('prefers an existing v2 save and ignores junk v1', () => {
    const v2 = makeState()
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify(v2), [LEGACY_KEY]: JSON.stringify(v1()) })
    expect(loadChallenge(storage)).toEqual(v2)
    expect(loadChallenge(fakeStorage({ [LEGACY_KEY]: '{bad' }))).toBeNull()
    expect(loadChallenge(fakeStorage({ [LEGACY_KEY]: JSON.stringify({ version: 1 }) }))).toBeNull()
  })
})
