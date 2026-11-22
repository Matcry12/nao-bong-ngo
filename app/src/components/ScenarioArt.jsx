const F = '#FFE2A8'
const INK = '#4A4A4A'
const BLUE = '#3A86FF'
const OR = '#FF9F1C'
const LIP = '#E07F00'
const LINE = '#E8E8E8'
const SCREEN = '#EAF2FF'

const Phone = ({ x, y, glow }) => (
  <>
    <rect x={x} y={y} width="50" height="50" rx="10" fill={INK} />
    <rect x={x + 6} y={y + 6} width="38" height="38" rx="6" fill={SCREEN} />
    {glow && <circle cx={x + 42} cy={y + 4} r="8" fill={OR} />}
  </>
)

const scenes = {
  phone: ['Bàn học với vở bài tập và điện thoại đang sáng', () => (
    <>
      <rect x="60" y="70" width="140" height="56" rx="6" fill="#fff" />
      <rect x="74" y="84" width="80" height="6" rx="3" fill={LINE} />
      <rect x="74" y="98" width="100" height="6" rx="3" fill={LINE} />
      <rect x="74" y="112" width="60" height="6" rx="3" fill={LINE} />
      <rect x="210" y="40" width="10" height="86" rx="5" fill={BLUE} transform="rotate(20 215 83)" />
      <Phone x={246} y={76} glow />
      <path d="M306 70q8 10 0 20M318 62q14 18 0 36" fill="none" stroke={LIP} strokeWidth="4" strokeLinecap="round" />
    </>
  )],
  group: ['Ba bạn ngồi học nhóm quanh bàn, điện thoại trên bàn', () => (
    <>
      <rect x="70" y="96" width="210" height="14" rx="7" fill="#fff" />
      {[110, 175, 240].map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy="56" r="20" fill={[OR, BLUE, '#3CB371'][i]} />
          <rect x={cx - 18} y="78" width="36" height="20" rx="10" fill={[OR, BLUE, '#3CB371'][i]} />
        </g>
      ))}
      <Phone x={130} y={70} glow />
    </>
  )],
  dinner: ['Bàn ăn với bát cơm và điện thoại bên cạnh', () => (
    <>
      <ellipse cx="150" cy="100" rx="70" ry="14" fill="#fff" />
      <path d="M100 96a50 40 0 0 1 100 0Z" fill="#fff" />
      <path d="M112 90a38 28 0 0 1 76 0Z" fill={OR} />
      <rect x="226" y="62" width="14" height="52" rx="7" fill={BLUE} />
      <Phone x={256} y={76} glow />
    </>
  )],
  moon: ['Trăng khuyết trên bầu trời đêm và điện thoại sáng', () => (
    <>
      <rect x="0" y="0" width="350" height="118" fill="#3D4A6B" />
      <path d="M96 24a34 34 0 1 0 34 44a28 28 0 1 1-34-44Z" fill="#FFE2A8" />
      <circle cx="220" cy="30" r="3" fill="#fff" /><circle cx="270" cy="56" r="3" fill="#fff" /><circle cx="180" cy="74" r="3" fill="#fff" />
      <Phone x={150} y={76} glow />
    </>
  )],
  paper: ['Tờ bài kiểm tra bị gạch đỏ', () => (
    <>
      <rect x="120" y="22" width="110" height="100" rx="8" fill="#fff" />
      <rect x="136" y="40" width="60" height="6" rx="3" fill={LINE} />
      <rect x="136" y="56" width="78" height="6" rx="3" fill={LINE} />
      <rect x="136" y="72" width="50" height="6" rx="3" fill={LINE} />
      <path d="M170 92q14-14 28 0t28 0" fill="none" stroke="#F25C54" strokeWidth="5" strokeLinecap="round" />
    </>
  )],
  spark: ['Điện thoại với các ngôi sao nổi bật', () => (
    <>
      <Phone x={150} y={64} />
      {[[110, 52], [240, 48], [226, 100]].map(([x, y]) => (
        <path key={x} d={`M${x} ${y - 14}l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z`} fill={OR} />
      ))}
      <path d="M96 96l4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill={BLUE} />
    </>
  )],
  bed: ['Chiếc giường với gối và điện thoại', () => (
    <>
      <rect x="70" y="84" width="210" height="36" rx="8" fill={BLUE} />
      <rect x="70" y="62" width="14" height="58" rx="6" fill="#2667D9" />
      <rect x="92" y="68" width="60" height="22" rx="11" fill="#fff" />
      <rect x="160" y="74" width="110" height="14" rx="7" fill="#EAF2FF" />
      <Phone x={226} y={36} glow />
    </>
  )],
  sun: ['Mặt trời và quả cầu đá trên bãi cỏ', () => (
    <>
      <rect x="0" y="0" width="350" height="118" fill="#EAF2FF" />
      <circle cx="270" cy="44" r="26" fill={OR} />
      <path d="M0 110q90-40 190 0t160-10v58H0Z" fill="#3CB371" />
      <circle cx="120" cy="86" r="14" fill="#fff" /><path d="M110 86h20M120 76v20" stroke={LINE} strokeWidth="4" />
    </>
  )],
}

export default function ScenarioArt({ icon }) {
  const [label, Draw] = scenes[icon] ?? scenes.phone
  const night = icon === 'moon'
  return (
    <div className="scenario-art">
      <svg viewBox="0 0 350 160" role="img" aria-label={label}>
        <rect x="0" y="118" width="350" height="42" fill={night ? '#2E3957' : F} />
        <Draw />
      </svg>
    </div>
  )
}
