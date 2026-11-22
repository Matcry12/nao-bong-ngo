import { describe, it, expect } from 'vitest'
import {
  readGameRisk,
  patienceRisk,
  skipRisk,
  phoneDownRisk,
  selfReportScore,
  totalScore,
  breakdown,
  levelFor,
  REASONS,
  tallyReasons,
  topReasons,
  worstBar,
  buildPlan,
} from './scoring.js'

describe('readGameRisk', () => {
  it('is 0 for a perfect run', () => {
    expect(readGameRisk({ notifTaps: 0, wrong: 0 })).toBe(0)
  })
  it('adds taps*15 and wrong*13', () => {
    expect(readGameRisk({ notifTaps: 2, wrong: 1 })).toBe(43)
  })
  it('caps taps at 60 and wrong at 40', () => {
    expect(readGameRisk({ notifTaps: 4, wrong: 3 })).toBe(99)
    expect(readGameRisk({ notifTaps: 10, wrong: 10 })).toBe(100)
  })
  it('defaults readingSeconds to 60 so no reading penalty applies', () => {
    expect(readGameRisk({ notifTaps: 2, wrong: 1 })).toBe(43)
    expect(readGameRisk({ notifTaps: 2, wrong: 1, readingSeconds: 60 })).toBe(43)
    expect(readGameRisk({})).toBe(0)
  })
  it('adds 20 when readingSeconds is under 20', () => {
    expect(readGameRisk({ readingSeconds: 5 })).toBe(20)
    expect(readGameRisk({ readingSeconds: 19 })).toBe(20)
    expect(readGameRisk({ readingSeconds: 20 })).toBe(0)
  })
  it('never exceeds 100', () => {
    expect(readGameRisk({ notifTaps: 10, wrong: 10, readingSeconds: 3 })).toBe(100)
  })
})

describe('patienceRisk', () => {
  it('is 0 with no impatience', () => {
    expect(patienceRisk({ earlyTaps: 0, gaveUp: false })).toBe(0)
    expect(patienceRisk({})).toBe(0)
  })
  it('adds earlyTaps*25 and 25 for giving up', () => {
    expect(patienceRisk({ earlyTaps: 1 })).toBe(25)
    expect(patienceRisk({ earlyTaps: 0, gaveUp: true })).toBe(25)
    expect(patienceRisk({ earlyTaps: 2, gaveUp: true })).toBe(75)
  })
  it('caps early taps at 75 and total at 100', () => {
    expect(patienceRisk({ earlyTaps: 3 })).toBe(75)
    expect(patienceRisk({ earlyTaps: 3, gaveUp: true })).toBe(100)
    expect(patienceRisk({ earlyTaps: 99, gaveUp: true })).toBe(100)
  })
})

describe('skipRisk', () => {
  it('defaults to total 45 and 0 seconds watched', () => {
    expect(skipRisk({})).toBe(100)
    expect(skipRisk({ secondsWatched: 0 })).toBe(100)
  })
  it('is 0 when watched fully', () => {
    expect(skipRisk({ secondsWatched: 45 })).toBe(0)
    expect(skipRisk({ secondsWatched: 45, total: 45 })).toBe(0)
  })
  it('is proportional in between', () => {
    expect(skipRisk({ secondsWatched: 22.5, total: 45 })).toBe(50)
    expect(skipRisk({ secondsWatched: 30, total: 60 })).toBe(50)
  })
  it('clamps out-of-range input', () => {
    expect(skipRisk({ secondsWatched: 999, total: 45 })).toBe(0)
    expect(skipRisk({ secondsWatched: -10, total: 45 })).toBe(100)
  })
  it('respects a custom total', () => {
    expect(skipRisk({ secondsWatched: 0, total: 10 })).toBe(100)
    expect(skipRisk({ secondsWatched: 5, total: 10 })).toBe(50)
  })
})

describe('phoneDownRisk', () => {
  it('is 0 with no touches', () => {
    expect(phoneDownRisk({ touches: 0 })).toBe(0)
    expect(phoneDownRisk({})).toBe(0)
  })
  it('counts 25 per touch', () => {
    expect(phoneDownRisk({ touches: 1 })).toBe(25)
    expect(phoneDownRisk({ touches: 3 })).toBe(75)
    expect(phoneDownRisk({ touches: 4 })).toBe(100)
  })
  it('caps at 100', () => {
    expect(phoneDownRisk({ touches: 10 })).toBe(100)
    expect(phoneDownRisk({ touches: 100 })).toBe(100)
  })
})

describe('selfReportScore', () => {
  it('is 0 for empty or missing answers', () => {
    expect(selfReportScore([])).toBe(0)
    expect(selfReportScore()).toBe(0)
    expect(selfReportScore(null)).toBe(0)
    expect(selfReportScore(undefined)).toBe(0)
  })
  it('is 0 when every answer is 0', () => {
    expect(selfReportScore([0, 0, 0, 0, 0])).toBe(0)
  })
  it('is 100 when every answer is 4', () => {
    expect(selfReportScore([4, 4, 4, 4, 4])).toBe(100)
  })
  it('scales the average and rounds', () => {
    expect(selfReportScore([4])).toBe(100)
    expect(selfReportScore([2])).toBe(50)
    expect(selfReportScore([1])).toBe(25)
    expect(selfReportScore([0, 1, 2, 3, 4])).toBe(50)
    expect(selfReportScore([3, 3, 3])).toBe(75)
    expect(selfReportScore([1, 2])).toBe(38)
  })
})

describe('totalScore', () => {
  it('is 0 when everything is 0', () => {
    expect(totalScore({ read: 0, patience: 0, skip: 0, phone: 0, self: 0 })).toBe(0)
    expect(totalScore({})).toBe(0)
  })
  it('is 100 when everything is 100', () => {
    expect(totalScore({ read: 100, patience: 100, skip: 100, phone: 100, self: 100 })).toBe(100)
  })
  it('weights quiz signals 60% and self-report 40%', () => {
    expect(totalScore({ read: 100, patience: 100, skip: 100, phone: 100, self: 0 })).toBe(60)
    expect(totalScore({ read: 0, patience: 0, skip: 0, phone: 0, self: 100 })).toBe(40)
    expect(totalScore({ read: 50, patience: 50, skip: 50, phone: 50, self: 50 })).toBe(50)
  })
  it('rounds to an integer', () => {
    expect(totalScore({ read: 33, patience: 0, skip: 0, phone: 0, self: 0 })).toBe(5)
    expect(Number.isInteger(totalScore({ read: 43, patience: 25, skip: 50, phone: 25, self: 62 }))).toBe(true)
  })
})

describe('breakdown', () => {
  it('returns zeros for empty input', () => {
    expect(breakdown({})).toEqual({ focus: 0, patience: 0, switchUrge: 0, phone: 0 })
    expect(breakdown({ selfAnswers: [] })).toEqual({
      focus: 0,
      patience: 0,
      switchUrge: 0,
      phone: 0,
    })
  })
  it('maps read/patience/skip straight through', () => {
    const result = breakdown({ read: 40, patience: 30, skip: 20, phone: 0 })
    expect(result.focus).toBe(40)
    expect(result.patience).toBe(30)
    expect(result.switchUrge).toBe(20)
  })
  it('averages the phone signal with the first self answer', () => {
    expect(breakdown({ phone: 100, selfAnswers: [4] }).phone).toBe(100)
    expect(breakdown({ phone: 0, selfAnswers: [4] }).phone).toBe(50)
    expect(breakdown({ phone: 50, selfAnswers: [2] }).phone).toBe(50)
    expect(breakdown({ phone: 50, selfAnswers: [0] }).phone).toBe(25)
    expect(breakdown({ phone: 0, selfAnswers: [] }).phone).toBe(0)
  })
  it('ignores self answers beyond the first and rounds', () => {
    expect(breakdown({ phone: 0, selfAnswers: [1, 4, 4] }).phone).toBe(13)
    expect(breakdown({ phone: 25, selfAnswers: [3] }).phone).toBe(50)
  })
})

describe('levelFor', () => {
  it('thresholds', () => {
    expect(levelFor(0)).toMatchObject({ label: 'Thấp', mood: 'calm' })
    expect(levelFor(39)).toMatchObject({ label: 'Thấp' })
    expect(levelFor(40)).toMatchObject({ label: 'Trung bình', mood: 'wobble' })
    expect(levelFor(69)).toMatchObject({ label: 'Trung bình' })
    expect(levelFor(70)).toMatchObject({ label: 'Cao', mood: 'popped' })
    expect(levelFor(100)).toMatchObject({ label: 'Cao' })
  })
})

describe('REASONS', () => {
  it('exports the six reasons in tie-break order', () => {
    expect(REASONS).toEqual(['content', 'habit', 'fomo', 'friends', 'stress', 'selfControl'])
  })
})

describe('tallyReasons', () => {
  it('returns all six keys as zero for empty or missing input', () => {
    const zeros = { content: 0, habit: 0, fomo: 0, friends: 0, stress: 0, selfControl: 0 }
    expect(tallyReasons([])).toEqual(zeros)
    expect(tallyReasons()).toEqual(zeros)
    expect(tallyReasons(undefined)).toEqual(zeros)
    expect(tallyReasons(null)).toEqual(zeros)
  })

  it('always returns every reason key even when absent from choices', () => {
    const totals = tallyReasons([{ content: 1 }])
    expect(Object.keys(totals).sort()).toEqual([...REASONS].sort())
    expect(totals).toEqual({ content: 1, habit: 0, fomo: 0, friends: 0, stress: 0, selfControl: 0 })
  })

  it('sums the same reason across multiple choices', () => {
    expect(tallyReasons([{ fomo: 2, habit: 1 }, { fomo: 3, habit: 4 }])).toEqual({
      content: 0,
      habit: 5,
      fomo: 5,
      friends: 0,
      stress: 0,
      selfControl: 0,
    })
  })

  it('sums every reason independently', () => {
    expect(
      tallyReasons([
        { content: 1, habit: 2, fomo: 3, friends: 4, stress: 5, selfControl: 6 },
        { content: 1, habit: 1, fomo: 1, friends: 1, stress: 1, selfControl: 1 },
      ])
    ).toEqual({ content: 2, habit: 3, fomo: 4, friends: 5, stress: 6, selfControl: 7 })
  })

  it('ignores unknown keys', () => {
    expect(tallyReasons([{ fomo: 2, boredom: 100, content: 1 }])).toEqual({
      content: 1,
      habit: 0,
      fomo: 2,
      friends: 0,
      stress: 0,
      selfControl: 0,
    })
  })

  it('accepts zero values without changing totals', () => {
    expect(tallyReasons([{ content: 0, habit: 0 }, { habit: 2 }])).toEqual({
      content: 0,
      habit: 2,
      fomo: 0,
      friends: 0,
      stress: 0,
      selfControl: 0,
    })
  })

  it('skips malformed entries instead of throwing', () => {
    expect(tallyReasons([null, 3, 'x', { stress: 2 }])).toEqual({
      content: 0,
      habit: 0,
      fomo: 0,
      friends: 0,
      stress: 2,
      selfControl: 0,
    })
  })
})

describe('topReasons', () => {
  it('returns only the top reason when the rest are zero', () => {
    expect(topReasons({ content: 10, habit: 0, fomo: 0 })).toEqual(['content'])
  })

  it('returns the top two when the second scores at least 50% of the first', () => {
    expect(topReasons({ content: 10, habit: 5 })).toEqual(['content', 'habit'])
    expect(topReasons({ content: 10, habit: 8 })).toEqual(['content', 'habit'])
    expect(topReasons({ content: 6, habit: 3 })).toEqual(['content', 'habit'])
  })

  it('drops the second when it scores below 50% of the first', () => {
    expect(topReasons({ content: 10, habit: 4 })).toEqual(['content'])
    expect(topReasons({ content: 7, habit: 3 })).toEqual(['content'])
    expect(topReasons({ content: 2, habit: 1 })).toEqual(['content', 'habit'])
    expect(topReasons({ content: 1, habit: 0 })).toEqual(['content'])
  })

  it('keeps a tied second reason', () => {
    expect(topReasons({ content: 5, habit: 5 })).toEqual(['content', 'habit'])
    expect(topReasons({ habit: 5, fomo: 5 })).toEqual(['habit', 'fomo'])
  })

  it('breaks ties by REASONS order', () => {
    expect(topReasons({ selfControl: 4, stress: 4, content: 4 })).toEqual(['content', 'stress'])
    expect(topReasons({ friends: 3, fomo: 3, habit: 3 })).toEqual(['habit', 'fomo'])
  })

  it('uses REASONS order to choose the single highest on a complete tie', () => {
    expect(topReasons({ content: 1, habit: 1, fomo: 1, friends: 1, stress: 1, selfControl: 1 })).toEqual([
      'content',
      'habit',
    ])
  })

  it('returns ["habit"] when every score is zero or absent', () => {
    expect(topReasons()).toEqual(['habit'])
    expect(topReasons({})).toEqual(['habit'])
    expect(topReasons({ content: 0, habit: 0, fomo: 0 })).toEqual(['habit'])
  })

  it('ignores unknown keys', () => {
    expect(topReasons({ boredom: 100, content: 1 })).toEqual(['content'])
  })

  it('works with the output of tallyReasons', () => {
    expect(topReasons(tallyReasons([{ fomo: 4 }, { fomo: 1, habit: 3 }]))).toEqual(['fomo', 'habit'])
    expect(topReasons(tallyReasons([{ fomo: 4 }, { fomo: 1, habit: 2 }]))).toEqual(['fomo'])
  })
})

describe('worstBar', () => {
  it('returns the key with the highest value', () => {
    expect(worstBar({ focus: 10, patience: 20, switchUrge: 30, phone: 40 })).toBe('phone')
    expect(worstBar({ focus: 10, patience: 20, switchUrge: 30, phone: 5 })).toBe('switchUrge')
    expect(worstBar({ focus: 10, patience: 20, switchUrge: 2, phone: 5 })).toBe('patience')
    expect(worstBar({ focus: 10, patience: 2, switchUrge: 2, phone: 5 })).toBe('focus')
  })

  it('breaks ties by focus, patience, switchUrge, phone order', () => {
    expect(worstBar({ focus: 5, patience: 5, switchUrge: 5, phone: 5 })).toBe('focus')
    expect(worstBar({ patience: 5, switchUrge: 5, phone: 5 })).toBe('patience')
    expect(worstBar({ switchUrge: 5, phone: 5 })).toBe('switchUrge')
    expect(worstBar({ switchUrge: 2, phone: 5 })).toBe('phone')
  })

  it('defaults missing bars to zero and returns focus when all are zero', () => {
    expect(worstBar({})).toBe('focus')
    expect(worstBar()).toBe('focus')
    expect(worstBar({ focus: 0, patience: 0, switchUrge: 0, phone: 0 })).toBe('focus')
    expect(worstBar({ phone: 1 })).toBe('phone')
  })
})

describe('buildPlan', () => {
  const reasonSolutions = {
    content: ['c1', 'c2', 'c3'],
    habit: ['h1', 'h2'],
    fomo: ['f1'],
    friends: [],
    stress: ['s1'],
    selfControl: ['sc1'],
  }

  it('builds three unique ids from top reasons and the worst bar', () => {
    const plan = buildPlan({
      top: ['content', 'habit'],
      worst: 'phone',
      reasonSolutions,
      barSolutions: { phone: 'p1' },
    })
    expect(plan).toEqual(['c1', 'h1', 'p1'])
    expect(new Set(plan).size).toBe(3)
  })

  it('uses the second reason first unused when top has two reasons', () => {
    const plan = buildPlan({
      top: ['content', 'habit'],
      worst: 'focus',
      reasonSolutions,
      barSolutions: { focus: 'b1' },
    })
    expect(plan).toEqual(['c1', 'h1', 'b1'])
  })

  it('takes a second solution from the top reason when there is only one reason', () => {
    const plan = buildPlan({
      top: ['content'],
      worst: 'focus',
      reasonSolutions,
      barSolutions: { focus: 'b1' },
    })
    expect(plan).toEqual(['c1', 'c2', 'b1'])
  })

  it('skips the second reason solution when it is already chosen', () => {
    const plan = buildPlan({
      top: ['content', 'habit'],
      worst: 'focus',
      reasonSolutions: { content: ['shared'], habit: ['shared', 'h1'] },
      barSolutions: { focus: 'b1' },
    })
    expect(plan).toEqual(['shared', 'h1', 'b1'])
  })

  it('fills the bar slot when the bar solution duplicates a reason solution', () => {
    const plan = buildPlan({
      top: ['content', 'habit'],
      worst: 'phone',
      reasonSolutions,
      barSolutions: { phone: 'c1' },
    })
    expect(plan).toEqual(['c1', 'h1', 'c2'])
    expect(new Set(plan).size).toBe(3)
  })

  it('fills the bar slot from reason lists when no bar solution exists', () => {
    const plan = buildPlan({
      top: ['content', 'habit'],
      worst: 'phone',
      reasonSolutions,
    })
    expect(plan).toEqual(['c1', 'h1', 'c2'])
  })

  it('falls back to the next unused top-reason id when the second reason has no list', () => {
    const plan = buildPlan({
      top: ['content', 'habit'],
      worst: 'focus',
      reasonSolutions: { content: ['c1', 'c2'], habit: [] },
      barSolutions: { focus: 'b1' },
    })
    expect(plan).toEqual(['c1', 'c2', 'b1'])
  })

  it('scans the top reason first when its list is empty', () => {
    const plan = buildPlan({
      top: ['content', 'habit'],
      worst: 'focus',
      reasonSolutions: { content: [], habit: ['h1'] },
      barSolutions: { focus: 'b1' },
    })
    expect(plan).toEqual(['h1', 'b1'])
  })

  it('scans the other reasons in REASONS order to fill missing slots', () => {
    const plan = buildPlan({
      top: ['stress'],
      worst: 'phone',
      reasonSolutions: {
        content: ['c1'],
        habit: ['h1'],
        fomo: ['f1'],
        friends: [],
        stress: [],
        selfControl: ['sc1'],
      },
    })
    expect(plan).toEqual(['c1', 'h1', 'f1'])
  })

  it('returns only the ids that exist when fewer than three unique ids are available', () => {
    expect(
      buildPlan({
        top: ['content', 'habit'],
        worst: 'focus',
        reasonSolutions: { content: ['x'], habit: ['x'] },
        barSolutions: { focus: 'x' },
      })
    ).toEqual(['x'])

    expect(
      buildPlan({
        top: ['content'],
        worst: 'focus',
        reasonSolutions: { content: [] },
        barSolutions: { focus: 'b1' },
      })
    ).toEqual(['b1'])
  })

  it('handles missing arguments and empty configuration', () => {
    expect(buildPlan()).toEqual([])
    expect(buildPlan({})).toEqual([])
    expect(buildPlan({ top: [], reasonSolutions: {}, barSolutions: {} })).toEqual([])
    expect(buildPlan({ top: ['content'], reasonSolutions: {} })).toEqual([])
  })

  it('never returns duplicates', () => {
    const plan = buildPlan({
      top: ['content', 'habit'],
      worst: 'phone',
      reasonSolutions: { content: ['a', 'b'], habit: ['a'], fomo: ['a'] },
      barSolutions: { phone: 'b' },
    })
    expect(new Set(plan).size).toBe(plan.length)
  })

  it('does not mutate the provided solutions', () => {
    const reasons = { content: ['c1', 'c2'], habit: ['h1'] }
    const bars = { focus: 'b1' }
    const snapshotReasons = JSON.parse(JSON.stringify(reasons))
    const snapshotBars = JSON.parse(JSON.stringify(bars))

    buildPlan({ top: ['content', 'habit'], worst: 'focus', reasonSolutions: reasons, barSolutions: bars })

    expect(reasons).toEqual(snapshotReasons)
    expect(bars).toEqual(snapshotBars)
  })

  it('integrates with topReasons and worstBar', () => {
    const plan = buildPlan({
      top: topReasons({ fomo: 9, habit: 5, content: 1 }),
      worst: worstBar({ focus: 1, patience: 9, switchUrge: 3, phone: 2 }),
      reasonSolutions,
      barSolutions: { patience: 'p2' },
    })
    expect(plan).toEqual(['f1', 'h1', 'p2'])
  })

  describe('with groupOf', () => {
    it('replaces the third id when all three chosen ids share a group', () => {
      const plan = buildPlan({
        top: ['content', 'habit'],
        worst: 'phone',
        reasonSolutions,
        barSolutions: { phone: 'p1' },
        groupOf: {
          c1: 'self',
          c2: 'family',
          c3: 'self',
          h1: 'self',
          h2: 'self',
          p1: 'self',
        },
      })
      expect(plan).toEqual(['c1', 'h1', 'c2'])
      expect(new Set(plan).size).toBe(3)
    })

    it('scans top reasons first, then the rest of REASONS order, for the replacement', () => {
      const plan = buildPlan({
        top: ['content', 'habit'],
        worst: 'phone',
        reasonSolutions: { content: ['c1'], habit: ['h1'], fomo: ['f1'] },
        barSolutions: { phone: 'p1' },
        groupOf: { c1: 'self', h1: 'self', f1: 'friends', p1: 'self' },
      })
      expect(plan).toEqual(['c1', 'h1', 'f1'])
    })

    it('leaves the plan unchanged when the groups are already mixed', () => {
      const plan = buildPlan({
        top: ['content', 'habit'],
        worst: 'phone',
        reasonSolutions,
        barSolutions: { phone: 'p1' },
        groupOf: { c1: 'self', h1: 'friends', p1: 'school' },
      })
      expect(plan).toEqual(['c1', 'h1', 'p1'])
    })

    it('keeps the original third id when no different-group id is available', () => {
      const plan = buildPlan({
        top: ['content', 'habit'],
        worst: 'phone',
        reasonSolutions: { content: ['c1', 'c2'], habit: ['h1'] },
        barSolutions: { phone: 'p1' },
        groupOf: { c1: 'self', c2: 'self', h1: 'self', p1: 'self' },
      })
      expect(plan).toEqual(['c1', 'h1', 'p1'])
    })
  })

  it('is unchanged when groupOf is omitted', () => {
    const plan = buildPlan({
      top: ['content', 'habit'],
      worst: 'phone',
      reasonSolutions,
      barSolutions: { phone: 'p1' },
    })
    expect(plan).toEqual(['c1', 'h1', 'p1'])
  })
})
