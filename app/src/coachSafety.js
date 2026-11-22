export const ACCENTED_CRISIS = [
  'tự tử',
  'tự sát',
  'muốn chết',
  'tự làm hại',
  'tự hại',
  'không muốn sống',
  'kết thúc cuộc đời',
  'cắt tay',
  'nhảy lầu',
  'chán sống',
  'sống làm gì',
  'biến mất mãi mãi',
  'không muốn tồn tại',
  'muốn biến mất',
  'tự kết liễu',
  'chết đi cho xong',
  'chết cho rồi',
]

// NOTE: 'tu tu' is deliberately absent — unaccented it is indistinguishable
// from 'từ từ' ("slowly"), which is a completely harmless thing to write.
export const PLAIN_CRISIS = [
  'tu sat',
  'muon chet',
  'tu lam hai',
  'khong muon song',
  'ket thuc cuoc doi',
  'cat tay',
  'nhay lau',
  'chan song',
  'song lam gi',
  'muon tu tu',
  'dinh tu tu',
  'se tu tu',
  'nghi den tu tu',
  'nghi toi tu tu',
  'khong muon ton tai',
  'muon bien mat',
  'tu ket lieu',
  'chet di cho xong',
  'chet cho roi',
  'kill myself',
  'suicide',
  'self harm',
  'want to die',
]

// Char codes of the regex metacharacters, so no literal metacharacters sit in source.
const SPECIAL_CODES = [36, 40, 41, 42, 43, 46, 63, 91, 92, 93, 94, 123, 124, 125]

function escapeRe(text) {
  let out = ''
  for (const ch of String(text)) {
    out += SPECIAL_CODES.includes(ch.charCodeAt(0)) ? '\\' + ch : ch
  }
  return out
}

const COMBINING_MARKS = new RegExp('[\\u0300-\\u036F]', 'g')

// Lowercase, strip diacritics (U+0300-U+036F), đ -> d, collapse whitespace, trim.
export function normalizeVi(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim()
}

// Lowercased NFC text, whitespace collapsed, accents kept for the accented list.
function foldedOriginal(text) {
  return String(text || '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

const BOUNDARY_BEFORE = '(^|\\s|[.,!?…])'
const BOUNDARY_AFTER = '($|\\s|[.,!?…])'

// Vietnamese teen / no-accent shorthand, keyed by the already-normalized word.
// 'ch' is deliberately absent: it is 'chị' or 'chưa', not a negation.
const TEEN_SHORTHAND = {
  ko: 'khong',
  k: 'khong',
  hok: 'khong',
  hong: 'khong',
  hem: 'khong',
  kh: 'khong',
  khg: 'khong',
  kg: 'khong',
  mun: 'muon', // also covers 'mún', which normalizes to 'mun'
}

// Expands shorthand word by word on the normalized text, keeping punctuation.
export function expandTeenShorthand(normalized) {
  if (!normalized) return ''
  return String(normalized)
    .split(' ')
    .map(function (token) {
      const parts = /^([^a-z0-9]*)([a-z]+)([^a-z0-9]*)$/.exec(token)
      if (!parts) return token
      const mapped = TEEN_SHORTHAND[parts[2]]
      return mapped ? parts[1] + mapped + parts[3] : token
    })
    .join(' ')
}

// Whole-word phrase match on already-normalized text.
function hasPlainPhrase(normalized) {
  if (!normalized) return false
  return PLAIN_CRISIS.some(function (phrase) {
    return new RegExp(BOUNDARY_BEFORE + escapeRe(phrase) + BOUNDARY_AFTER).test(normalized)
  })
}

export function detectCrisis(text) {
  const accented = foldedOriginal(text)
  if (accented && ACCENTED_CRISIS.some(function (phrase) { return accented.includes(phrase) })) {
    return true
  }
  const plain = normalizeVi(text)
  return hasPlainPhrase(plain) || hasPlainPhrase(expandTeenShorthand(plain))
}

function localDateKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}

export function createLimiter(options) {
  const opts = options || {}
  const storage = opts.storage
  const limit = typeof opts.limit === 'number' ? opts.limit : 20
  const now = typeof opts.now === 'function' ? opts.now : function () { return new Date() }

  function keyFor() {
    return 'coach-count:' + localDateKey(now())
  }

  function read() {
    try {
      const raw = storage ? storage.getItem(keyFor()) : null
      const n = parseInt(raw, 10)
      return Number.isFinite(n) && n > 0 ? n : 0
    } catch {
      return 0
    }
  }

  function write(value) {
    try {
      if (storage && typeof storage.setItem === 'function') {
        storage.setItem(keyFor(), String(value))
      }
    } catch {
      // Storage missing or full: harmless, the in-memory counter still works.
    }
  }

  // In-memory mirror so consume() stays meaningful when storage rejects writes.
  let memory = 0
  let memoryKey = keyFor()

  function rollIfNewDay() {
    const key = keyFor()
    if (key !== memoryKey) {
      memoryKey = key
      memory = 0
    }
  }

  function used() {
    rollIfNewDay()
    return Math.max(read(), memory)
  }

  return {
    used: used,
    remaining: function () { return Math.max(0, limit - used()) },
    consume: function () {
      const count = used()
      if (count >= limit) return false
      memory = count + 1
      memoryKey = keyFor()
      write(memory)
      return true
    },
  }
}
