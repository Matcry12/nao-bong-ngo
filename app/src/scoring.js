const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

export function readGameRisk({ notifTaps = 0, wrong = 0, readingSeconds = 60 } = {}) {
  return Math.min(
    100,
    Math.min(notifTaps * 15, 60) + Math.min(wrong * 13, 40) + (readingSeconds < 20 ? 20 : 0)
  )
}

export function patienceRisk({ earlyTaps = 0, gaveUp = false } = {}) {
  return Math.min(100, Math.min(earlyTaps * 25, 75) + (gaveUp ? 25 : 0))
}

export function skipRisk({ secondsWatched = 0, total = 45 } = {}) {
  if (!total) return 0
  return Math.round((1 - clamp(secondsWatched, 0, total) / total) * 100)
}

export function phoneDownRisk({ touches = 0 } = {}) {
  return Math.min(touches * 25, 100)
}

export function selfReportScore(answers) {
  if (!Array.isArray(answers) || answers.length === 0) return 0
  const avg = answers.reduce((sum, n) => sum + n, 0) / answers.length
  return Math.round((avg / 4) * 100)
}

export function totalScore({ read = 0, patience = 0, skip = 0, phone = 0, self = 0 } = {}) {
  return Math.round(0.6 * ((read + patience + skip + phone) / 4) + 0.4 * self)
}

export function breakdown({ read = 0, patience = 0, skip = 0, phone = 0, selfAnswers = [] } = {}) {
  return {
    focus: read,
    patience,
    switchUrge: skip,
    phone: Math.round((phone + ((selfAnswers[0] ?? 0) / 4) * 100) / 2),
  }
}

export function levelFor(score) {
  if (score < 40) return { key: 'low', label: 'Thấp', mood: 'calm' }
  if (score < 70) return { key: 'medium', label: 'Trung bình', mood: 'wobble' }
  return { key: 'high', label: 'Cao', mood: 'popped' }
}
