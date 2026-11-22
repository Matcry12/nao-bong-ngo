export function readGameRisk({ notifTaps = 0, wrong = 0 }) {
  return Math.min(notifTaps * 15, 60) + Math.min(wrong * 13, 40)
}

export function levelFor(score) {
  if (score < 40) return { key: 'low', label: 'Thấp', mood: 'calm' }
  if (score < 70) return { key: 'medium', label: 'Trung bình', mood: 'wobble' }
  return { key: 'high', label: 'Cao', mood: 'popped' }
}
