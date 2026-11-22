import { describe, it, expect } from 'vitest'
import { readGameRisk, levelFor } from './scoring.js'

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
