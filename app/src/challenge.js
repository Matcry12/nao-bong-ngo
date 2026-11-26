export const STORAGE_KEY = 'nbn:challenge:v2'
export const LEGACY_KEY = 'nbn:challenge:v1'
export const TOTAL_DAYS = 21
export const TASK_DAYS = TOTAL_DAYS - 1

const BAR_KEYS = ['focus', 'patience', 'switchUrge', 'phone']
const VERSION = 2

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
    final: null,
  }
}

/** Week (1-3) a challenge day belongs to. */
export const weekOf = (day) => Math.min(3, Math.max(1, Math.ceil(day / 7)))

export function tasksFor(plan, solutions) {
  const list = Array.isArray(plan) ? plan : []
  const map = isPlainObject(solutions) ? solutions : {}
  const tasks = []
  for (let day = 1; day <= TASK_DAYS; day += 1) {
    const week = weekOf(day)
    const solutionId = list.length ? list[(day - 1) % list.length] : null
    const solution = solutionId !== null && isPlainObject(map[solutionId]) ? map[solutionId] : null
    const lines = solution && Array.isArray(solution.tasks) ? solution.tasks : []
    tasks.push({
      day,
      week,
      solutionId,
      text: typeof lines[week - 1] === 'string' ? lines[week - 1] : '',
    })
  }
  return tasks
}

export function nextDay(state) {
  const done = isPlainObject(state) && Array.isArray(state.done) ? state.done : []
  if (done.length < TASK_DAYS) return done.length + 1
  if (done.length === TASK_DAYS && state.final == null) return TOTAL_DAYS
  return null
}

// True when the player skipped at least one full day since their last activity.
export function streakAtRisk(state, today) {
  if (!isPlainObject(state) || nextDay(state) === null) return false
  const done = Array.isArray(state.done) ? state.done : []
  const last = done.length ? done[done.length - 1].date : state.startDate
  return daysBetween(last, today) >= 2
}

export function canPlay(state, today, { allowSameDay = false } = {}) {
  const next = nextDay(state)
  if (next === null) return { ok: false, reason: 'finished' }

  const done = Array.isArray(state.done) ? state.done : []
  if (!allowSameDay) {
    const last = done[done.length - 1]
    if (last && last.date === today) return { ok: false, reason: 'tomorrow' }
    if (next === TOTAL_DAYS) {
      // The retest needs the last task finished on an earlier calendar day.
      if (!last || !(daysBetween(last.date, today) > 0)) {
        return { ok: false, reason: 'tomorrow' }
      }
    }
  }

  return { ok: true, reason: 'ok' }
}

export function completeDay(state, day, today, opts = {}) {
  const next = nextDay(state)
  if (day !== next || day > TASK_DAYS) return state
  if (!canPlay(state, today, opts).ok) return state
  return { ...state, done: [...state.done, { day, date: today }] }
}

export function recordRetest(state, { score, bars } = {}, today, opts = {}) {
  if (nextDay(state) !== TOTAL_DAYS) return state
  if (!canPlay(state, today, opts).ok) return state
  return { ...state, final: { score: num(score), bars: { ...bars }, date: today } }
}

export function compare(state) {
  if (!isPlainObject(state) || !isPlainObject(state.final)) return null
  const day1 = isPlainObject(state.day1) ? state.day1 : {}
  const last = state.final
  const before = num(day1.score)
  const after = num(last.score)
  const delta = before - after
  const bars = {}
  for (const key of BAR_KEYS) {
    const first = isPlainObject(day1.bars) ? num(day1.bars[key]) : 0
    const end = isPlainObject(last.bars) ? num(last.bars[key]) : 0
    bars[key] = first - end
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
  if (!(data.final === null || isPlainObject(data.final))) return false
  return true
}

function migrateV1(data) {
  if (!isPlainObject(data) || data.version !== 1) return null
  const next = {
    version: VERSION,
    startDate: data.startDate,
    plan: data.plan,
    top: data.top,
    day1: data.day1,
    done: Array.isArray(data.done) ? data.done.slice(0, TASK_DAYS) : data.done,
    final: isPlainObject(data.day7) ? data.day7 : null,
  }
  // A v1 player who finished day 7 is finished: fill the days they never saw.
  if (next.final && Array.isArray(next.done)) {
    const date = next.final.date ?? next.startDate
    for (let day = next.done.length + 1; day <= TASK_DAYS; day += 1) next.done.push({ day, date })
  }
  return isValidState(next) ? next : null
}

export function loadChallenge(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw != null) {
      const data = JSON.parse(raw)
      return isValidState(data) ? data : null
    }
    const old = storage.getItem(LEGACY_KEY)
    if (old == null) return null
    const migrated = migrateV1(JSON.parse(old))
    if (!migrated) return null
    storage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    storage.removeItem(LEGACY_KEY)
    return migrated
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
