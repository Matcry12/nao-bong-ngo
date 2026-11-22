const BODY = 'M80 18C112 18 132 56 132 92C132 124 108 144 80 144C52 144 28 124 28 92C28 56 48 18 80 18Z'
const HIGHLIGHT = 'M80 18C96 18 109 28 117 42C101 37 59 37 43 42C51 28 64 18 80 18Z'
const INK = '#3D2A00'
const LIP = '#E07F00'
const PALE = '#FFD08A'
const PRIMARY = '#FF9F1C'

const Body = () => (
  <>
    <path d={BODY} fill={PRIMARY} />
    <path d={HIGHLIGHT} fill={PALE} />
  </>
)

const faces = {
  calm: ['Hạt Bắp bình tĩnh', () => (
    <>
      <Body />
      <circle cx="64" cy="88" r="6" fill={INK} />
      <circle cx="96" cy="88" r="6" fill={INK} />
      <path d="M68 106Q80 115 92 106" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="104" r="7" fill={LIP} />
      <circle cx="110" cy="104" r="7" fill={LIP} />
    </>
  )],
  wobble: ['Hạt Bắp đang rung lắc', () => (
    <>
      <path d="M14 68Q4 86 14 104" fill="none" stroke={LIP} strokeWidth="5" strokeLinecap="round" />
      <path d="M146 68Q156 86 146 104" fill="none" stroke={LIP} strokeWidth="5" strokeLinecap="round" />
      <g transform="rotate(-8 80 144)">
        <Body />
        <circle cx="64" cy="86" r="8" fill={INK} />
        <circle cx="96" cy="86" r="8" fill={INK} />
        <path d="M62 110q6-6 12 0t12 0t12 0" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </>
  )],
  popped: ['Hạt Bắp đã nổ', () => (
    <>
      <circle cx="46" cy="72" r="28" fill={PALE} />
      <circle cx="114" cy="72" r="28" fill={PALE} />
      <circle cx="58" cy="40" r="24" fill={PALE} />
      <circle cx="102" cy="40" r="24" fill={PALE} />
      <circle cx="80" cy="62" r="40" fill={PALE} />
      <path d="M28 96C28 128 52 146 80 146C108 146 132 128 132 96Z" fill={PRIMARY} />
      <circle cx="66" cy="64" r="8" fill={INK} />
      <circle cx="94" cy="64" r="8" fill={INK} />
      <ellipse cx="80" cy="84" rx="7" ry="9" fill={INK} />
    </>
  )],
  proud: ['Hạt Bắp tự hào', () => (
    <>
      <Body />
      <path d="M55 90q9-11 18 0M87 90q9-11 18 0" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M60 104Q80 130 100 104Z" fill={INK} />
      <circle cx="48" cy="104" r="7" fill={LIP} />
      <circle cx="112" cy="104" r="7" fill={LIP} />
      <path d="M138 18l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill={PALE} />
    </>
  )],
  talk: ['Hạt Bắp đang nói chuyện', () => (
    <>
      <Body />
      <circle cx="64" cy="82" r="6" fill={INK} />
      <circle cx="96" cy="82" r="6" fill={INK} />
      <ellipse cx="80" cy="106" rx="9" ry="10" fill={INK} />
      <circle cx="50" cy="100" r="7" fill={LIP} />
      <circle cx="110" cy="100" r="7" fill={LIP} />
    </>
  )],
  worried: ['Hạt Bắp lo lắng', () => (
    <>
      <Body />
      <path d="M54 80L72 74M106 80L88 74" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="64" cy="92" r="6" fill={INK} />
      <circle cx="96" cy="92" r="6" fill={INK} />
      <path d="M68 116Q80 106 92 116" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M134 44C140 54 142 59 142 63a8 8 0 0 1-16 0c0-4 2-9 8-19Z" fill="#3A86FF" />
    </>
  )],
}

export default function Mascot({ mood = 'calm', size = 160 }) {
  const [label, Face] = faces[mood] ?? faces.calm
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label={label}>
      <Face />
    </svg>
  )
}
