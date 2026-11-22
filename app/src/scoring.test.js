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
