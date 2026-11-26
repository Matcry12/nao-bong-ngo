// Decorative popcorn pieces floating up behind mascot screens. Purely visual.
const PIECES = [
  [8, 13, 0, 30], [22, 17, -9, 38], [36, 12, -4, 26], [52, 19, -13, 34],
  [66, 14, -2, 30], [80, 16, -7, 40], [92, 12, -11, 26],
]

export default function PopcornBg() {
  return (
    <div className="popbg" aria-hidden="true">
      {PIECES.map(([left, dur, delay, size]) => (
        <svg key={left} className="popbg__k" viewBox="0 0 40 40" width={size} height={size}
          style={{ left: `${left}%`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
          <circle cx="12" cy="20" r="8" fill="#FFD08A" />
          <circle cx="28" cy="20" r="8" fill="#FFD08A" />
          <circle cx="14" cy="15" r="8" fill="#FFF3DA" />
          <circle cx="26" cy="15" r="8" fill="#FFF3DA" />
          <circle cx="20" cy="9" r="8" fill="#FFFBF0" />
          <circle cx="20" cy="19" r="7" fill="#FFF3DA" />
          <path d="M11 24Q20 30 29 24L26 36Q20 39 14 36Z" fill="#FF9F1C" />
          <path d="M16 26L17 36M24 26L23 36" stroke="#E07F00" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  )
}
