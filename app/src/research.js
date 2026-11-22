export const CLIENT_KEY = 'nbn:cid'
export const CONSENT_KEY = 'nbn:consent'

export const HEADERS = [
  'timestamp',
  'clientId',
  'day',
  'school',
  'grade',
  'gender',
  'score',
  'level',
  'focus',
  'patience',
  'switchUrge',
  'phone',
  'reasons',
  'plan',
]

const EMPTY_INFO = { school: '', grade: '', gender: '' }

const clampText = (value) => (value == null ? '' : String(value).trim().slice(0, 60))

const joinList = (value) =>
  Array.isArray(value) ? value.map((item) => String(item)).join('; ') : ''

const barValue = (bars, key) => (bars[key] == null ? null : bars[key])

function randomId() {
  try {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID()
    }
  } catch {
    // Fall through to the Math.random-based id.
  }
  let id = ''
  for (let i = 0; i < 16; i += 1) id += Math.floor(Math.random() * 16).toString(16)
  return id
}

/** Return the stored anonymous client id, creating and saving one if needed. */
export function getClientId(storage) {
  try {
    const existing = storage.getItem(CLIENT_KEY)
    if (typeof existing === 'string' && existing) return existing
  } catch {
    // Ignore unreadable storage and fall through to creating an id.
  }
  const id = randomId()
  try {
    storage.setItem(CLIENT_KEY, id)
  } catch {
    // Storage may be full or blocked; still return a usable id.
  }
  return id
}

/** Read consent + profile info from storage, falling back to safe defaults. */
export function loadConsent(storage) {
  const fallback = { consent: false, info: { ...EMPTY_INFO } }
  try {
    const raw = storage.getItem(CONSENT_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    const info = parsed.info && typeof parsed.info === 'object' ? parsed.info : {}
    return {
      consent: parsed.consent === true,
      info: {
        school: typeof info.school === 'string' ? info.school : '',
        grade: typeof info.grade === 'string' ? info.grade : '',
        gender: typeof info.gender === 'string' ? info.gender : '',
      },
    }
  } catch {
    return fallback
  }
}

/** Persist consent + profile info. Never throws. */
export function saveConsent(storage, { consent = false, info = {} } = {}) {
  try {
    const source = info && typeof info === 'object' ? info : {}
    storage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        consent: consent === true,
        info: {
          school: typeof source.school === 'string' ? source.school : '',
          grade: typeof source.grade === 'string' ? source.grade : '',
          gender: typeof source.gender === 'string' ? source.gender : '',
        },
      }),
    )
  } catch {
    // Ignore storage failures.
  }
}

/** Shape one completed session into a row matching HEADERS exactly. */
export function buildRow({
  clientId,
  day,
  info = {},
  total,
  level,
  bars = {},
  reasons = [],
  plan = [],
  now = new Date(),
} = {}) {
  const profile = info && typeof info === 'object' ? info : {}
  const metrics = bars && typeof bars === 'object' ? bars : {}
  return {
    timestamp: now.toISOString(),
    clientId,
    day,
    school: clampText(profile.school),
    grade: clampText(profile.grade),
    gender: clampText(profile.gender),
    score: total,
    level: level == null ? '' : String(level),
    focus: barValue(metrics, 'focus'),
    patience: barValue(metrics, 'patience'),
    switchUrge: barValue(metrics, 'switchUrge'),
    phone: barValue(metrics, 'phone'),
    reasons: joinList(reasons),
    plan: joinList(plan),
  }
}

/** POST a row to the sheet endpoint. Resolves true on success, false otherwise. */
export async function sendRow(url, row, fetchImpl = globalThis.fetch) {
  if (!url) return false
  try {
    await fetchImpl(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(row),
    })
    return true
  } catch {
    return false
  }
}

/** GET the aggregated summary from the sheet endpoint, or null on any problem. */
export async function fetchSummary(url, fetchImpl = globalThis.fetch) {
  if (!url) return null
  try {
    const target = url + (url.includes('?') ? '&' : '?') + 'summary=1'
    const response = await fetchImpl(target)
    const data = await response.json()
    if (
      data &&
      typeof data === 'object' &&
      typeof data.count === 'number' &&
      Number.isFinite(data.count)
    ) {
      return data
    }
    return null
  } catch {
    return null
  }
}
