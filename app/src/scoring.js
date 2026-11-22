const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

export const REASONS = ['content', 'habit', 'fomo', 'friends', 'stress', 'selfControl']

const BAR_ORDER = ['focus', 'patience', 'switchUrge', 'phone']

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const isValidId = (id) => id !== undefined && id !== null

export function tallyReasons(choices) {
  const totals = Object.fromEntries(REASONS.map((reason) => [reason, 0]))
  if (!Array.isArray(choices)) return totals

  for (const choice of choices) {
    if (!isPlainObject(choice)) continue
    for (const reason of REASONS) {
      const value = choice[reason]
      if (typeof value === 'number' && Number.isFinite(value)) {
        totals[reason] += value
      }
    }
  }

  return totals
}

export function topReasons(points) {
  const safe = isPlainObject(points) ? points : {}
  const ranked = REASONS.map((reason, index) => ({
    reason,
    index,
    points: typeof safe[reason] === 'number' && Number.isFinite(safe[reason]) ? safe[reason] : 0,
  })).sort((a, b) => b.points - a.points || a.index - b.index)

  if (ranked.every((entry) => entry.points <= 0)) return ['habit']

  const [first, second] = ranked
  const picks = [first.reason]
  if (second.points > 0 && second.points >= first.points * 0.5) {
    picks.push(second.reason)
  }
  return picks
}

export function worstBar(bars) {
  const safe = isPlainObject(bars) ? bars : {}
  let worst = BAR_ORDER[0]
  let highest = typeof safe[worst] === 'number' && Number.isFinite(safe[worst]) ? safe[worst] : 0

  for (let index = 1; index < BAR_ORDER.length; index += 1) {
    const key = BAR_ORDER[index]
    const value = typeof safe[key] === 'number' && Number.isFinite(safe[key]) ? safe[key] : 0
    if (value > highest) {
      highest = value
      worst = key
    }
  }

  return worst
}

export function buildPlan({ top = [], worst, reasonSolutions = {}, barSolutions = {}, groupOf } = {}) {
  const topList = Array.isArray(top) ? top : []
  const reasonsMap = isPlainObject(reasonSolutions) ? reasonSolutions : {}
  const barsMap = isPlainObject(barSolutions) ? barSolutions : {}

  const listFor = (reason) => (Array.isArray(reasonsMap[reason]) ? reasonsMap[reason] : [])
  const chosen = []
  const chosenSet = new Set()

  const add = (id) => {
    if (!isValidId(id) || chosenSet.has(id)) return false
    chosenSet.add(id)
    chosen.push(id)
    return true
  }

  const firstUnused = (ids) => ids.find((id) => isValidId(id) && !chosenSet.has(id))

  const scanOrder = () => {
    const order = []
    for (const reason of topList.slice(0, 2)) {
      if (reason !== undefined && !order.includes(reason)) order.push(reason)
    }
    for (const reason of REASONS) {
      if (!order.includes(reason)) order.push(reason)
    }
    return order
  }

  const fillNext = () => {
    for (const reason of scanOrder()) {
      const id = firstUnused(listFor(reason))
      if (id !== undefined) {
        add(id)
        return true
      }
    }
    return false
  }

  // (a) first solution for the strongest reason
  if (!add(firstUnused(listFor(topList[0])))) fillNext()

  // (b) second reason's first unused solution, otherwise the next unused of the top reason
  const secondId = topList[1] !== undefined ? firstUnused(listFor(topList[1])) : firstUnused(listFor(topList[0]))
  if (!add(secondId)) fillNext()

  // (c) the solution tied to the worst bar
  if (!add(barsMap[worst])) fillNext()

  // (d) optional diversity: avoid three picks from the same group
  if (isPlainObject(groupOf) && chosen.length === 3) {
    const groups = chosen.map((id) => groupOf[id])
    if (groups[0] === groups[1] && groups[1] === groups[2]) {
      let replacement
      for (const reason of scanOrder()) {
        replacement = listFor(reason).find(
          (id) => isValidId(id) && !chosenSet.has(id) && groupOf[id] !== groups[0]
        )
        if (replacement !== undefined) break
      }
      if (replacement !== undefined) chosen[2] = replacement
    }
  }

  return chosen
}

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
