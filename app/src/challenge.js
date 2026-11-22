export const STORAGE_KEY = 'nbn:challenge:v1'

const BAR_KEYS = ['focus', 'patience', 'switchUrge', 'phone']
const VERSION = 1

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

const pad = (value) => String(value).padStart(2, '0')

function parseKey(key) {
  if (typeof key !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
}

/** Format a Date as 'YYYY-MM-DD' using local calendar parts. */
export function toDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Whole calendar days from key a to key b (b - a), immune to DST. */
export function daysBetween(a, b) {
  const from = parseKey(a)
  const to = parseKey(b)
  if (!from || !to) return NaN
  const start = Date.UTC(from.year, from.month - 1, from.day)
  const end = Date.UTC(to.year, to.month - 1, to.day)
  return Math.round((end - start) / 86400000)
}

export function createChallenge({ plan = [], top = [], score = 0, bars = {}, today = toDateKey() } = {}) {
  return {
    version: VERSION,
    startDate: today,
    plan: Array.isArray(plan) ? [...plan] : [],
    top: Array.isArray(top) ? [...top] : [],
    day1: { score: num(score), bars: { ...bars } },
    done: [],
    day7: null,
  }
}

export function tasksFor(plan, solutions) {
  const list = Array.isArray(plan) ? plan : []
  const map = isPlainObject(solutions) ? solutions : {}
  const tasks = []
  for (let day = 1; day <= 6; day += 1) {
    const solutionId = list.length ? list[(day - 1) % list.length] : null
    const solution = solutionId !== null && isPlainObject(map[solutionId]) ? map[solutionId] : null
    tasks.push({
      day,
      solutionId,
      text: solution && typeof solution.task7 === 'string' ? solution.task7 : '',
    })
  }
  return tasks
}

export function nextDay(state) {
  const done = isPlainObject(state) && Array.isArray(state.done) ? state.done : []
  if (done.length < 6) return done.length + 1
  if (done.length === 6 && state.day7 == null) return 7
  return null
}

export function canPlay(state, today, { allowSameDay = false } = {}) {
  const next = nextDay(state)
  if (next === null) return { ok: false, reason: 'finished' }

  const done = Array.isArray(state.done) ? state.done : []
  if (!allowSameDay) {
    const last = done[done.length - 1]
    if (last && last.date === today) return { ok: false, reason: 'tomorrow' }
    if (next === 7) {
      // Day 7 needs the sixth task finished on an earlier calendar day.
      if (!last || !(daysBetween(last.date, today) > 0)) {
        return { ok: false, reason: 'tomorrow' }
      }
    }
  }

  return { ok: true, reason: 'ok' }
}

export function completeDay(state, day, today, opts = {}) {
  const next = nextDay(state)
  if (day !== next || day > 6) return state
  if (!canPlay(state, today, opts).ok) return state
  return { ...state, done: [...state.done, { day, date: today }] }
}

export function recordRetest(state, { score, bars } = {}, today, opts = {}) {
  if (nextDay(state) !== 7) return state
  if (!canPlay(state, today, opts).ok) return state
  return { ...state, day7: { score: num(score), bars: { ...bars }, date: today } }
}

export function compare(state) {
  if (!isPlainObject(state) || !isPlainObject(state.day7)) return null
  const day1 = isPlainObject(state.day1) ? state.day1 : {}
  const day7 = state.day7
  const before = num(day1.score)
  const after = num(day7.score)
  const delta = before - after
  const bars = {}
  for (const key of BAR_KEYS) {
    const first = isPlainObject(day1.bars) ? num(day1.bars[key]) : 0
    const last = isPlainObject(day7.bars) ? num(day7.bars[key]) : 0
    bars[key] = first - last
  }
  return { before, after, delta, improved: delta > 0, bars }
}

function isValidState(data) {
  if (!isPlainObject(data)) return false
  if (data.version !== VERSION) return false
  if (typeof data.startDate !== 'string') return false
  if (!Array.isArray(data.plan) || !Array.isArray(data.top)) return false
  if (!isPlainObject(data.day1) || typeof data.day1.score !== 'number' || !isPlainObject(data.day1.bars)) return false
  if (!Array.isArray(data.done)) return false
  if (!(data.day7 === null || isPlainObject(data.day7))) return false
  return true
}

export function loadChallenge(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw == null) return null
    const data = JSON.parse(raw)
    if (!isValidState(data)) return null
    return data
  } catch {
    return null
  }
}

export function saveChallenge(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearChallenge(storage) {
  try {
    storage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
