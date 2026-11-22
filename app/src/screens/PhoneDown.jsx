import { useEffect, useRef, useState } from 'react'
import ProgressBar from '../components/ProgressBar.jsx'
import { content } from '../content.js'
import { SPEED } from '../speed.js'

const TOTAL = 60
const CIRC = 817

export default function PhoneDown({ progress, onFinish, onClose }) {
  const c = content.phone
  const start = useRef(Date.now())
  const [secs, setSecs] = useState(0)
  const [touches, setTouches] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const done = useRef(false)
  const tref = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      const s = ((Date.now() - start.current) / 1000) * SPEED
      setSecs(s)
      if (s >= TOTAL && !done.current) {
        done.current = true
        onFinish({ touches: tref.current })
      }
    }, 200)
    return () => clearInterval(id)
  }, [])

  const tap = () => {
    tref.current += 1
    setTouches(tref.current)
    setShakeKey((k) => k + 1)
  }
  const left = Math.max(0, Math.ceil(TOTAL - secs))
  const buzzing = secs % 6 < 1.5 // buzzes every few seconds
  const frac = Math.min(1, secs / TOTAL)
  const p = progress + frac * 10

  return (
    <div className="screen">
      <ProgressBar value={p} onClose={onClose} />
      <div className="screen__body" style={{ alignItems: 'center', gap: 24, padding: '16px 20px', textAlign: 'center' }}>
        <div className="eyebrow">{c.tag}</div>
        <h1 className="h2">{c.title}</h1>
        <div className="phone-wrap" onClick={tap} role="button" aria-label={`${c.phoneLabel}, còn ${left} giây`}>
          <svg viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="130" fill="none" stroke="#E8E8E8" strokeWidth="16" />
            <circle cx="150" cy="150" r="130" fill="none" stroke="#FF9F1C" strokeWidth="16" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * frac} transform="rotate(-90 150 150)" />
            <g key={shakeKey} className={buzzing || shakeKey ? 'buzz' : undefined}>
              {buzzing && (
                <>
                  <path d="M70 120q-10 30 0 60M54 108q-16 42 0 84" fill="none" stroke="#E07F00" strokeWidth="6" strokeLinecap="round" />
                  <path d="M230 120q10 30 0 60M246 108q16 42 0 84" fill="none" stroke="#E07F00" strokeWidth="6" strokeLinecap="round" />
                </>
              )}
              <rect x="100" y="68" width="100" height="164" rx="20" fill="#4A4A4A" />
              <rect x="110" y="84" width="80" height="124" rx="10" fill={buzzing ? '#FFD08A' : '#EAF2FF'} />
              <rect x="120" y="100" width="60" height="22" rx="8" fill="#FFFFFF" />
              <rect x="120" y="130" width="60" height="22" rx="8" fill="#FFFFFF" />
              <circle cx="182" cy="102" r="10" fill="#FF9F1C" />
              <rect x="136" y="216" width="28" height="6" rx="3" fill="#6F6F6F" />
            </g>
          </svg>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</div>
        <p className="small">{c.sub}</p>
        <p className="small" style={{ minHeight: 20, fontWeight: 800 }}>{touches > 0 ? `${c.touches}: ${touches}` : ''}</p>
      </div>
    </div>
  )
}
