import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { content } from '../content.js'
import { SPEED } from '../speed.js'

const TOTAL = 45

export default function Skip({ progress, onFinish, onClose }) {
  const c = content.skip
  const start = useRef(Date.now())
  const [secs, setSecs] = useState(0)
  const done = useRef(false)

  const finish = (s) => {
    if (done.current) return
    done.current = true
    onFinish({ secondsWatched: Math.min(TOTAL, Math.round(s)) })
  }
  useEffect(() => {
    const id = setInterval(() => {
      const s = ((Date.now() - start.current) / 1000) * SPEED
      setSecs(s)
      if (s >= TOTAL) finish(TOTAL)
    }, 200)
    return () => clearInterval(id)
  }, [])

  const left = Math.max(0, Math.ceil(TOTAL - secs))
  const p = progress + (Math.min(secs, TOTAL) / TOTAL) * 6
  return (
    <div className="screen">
      <ProgressBar value={p} onClose={onClose} />
      <div className="screen__body" style={{ gap: 24, padding: '16px 20px' }}>
        <div className="eyebrow">{c.tag}</div>
        <h1 className="h2">{c.title}</h1>
        <div className="scene">
          <svg viewBox="0 0 350 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label={c.sceneLabel}>
            <circle className="breathe" cx="250" cy="120" r="44" fill="#FFD08A" />
            <g className="cloud"><ellipse cx="40" cy="80" rx="36" ry="14" fill="#FFFFFF" /><ellipse cx="60" cy="70" rx="22" ry="14" fill="#FFFFFF" /></g>
            <path d="M0 250C70 200 140 210 210 240C270 266 310 250 350 230V360H0Z" fill="#B9E3C8" />
            <path d="M0 300C90 260 180 270 250 296C300 314 330 306 350 300V360H0Z" fill="#8FD0A8" />
            <text x="175" y="335" textAnchor="middle" fontSize="20" fontWeight="800" fill="#3D3D3D" fontFamily="Nunito, sans-serif">{c.breathe}</text>
          </svg>
        </div>
        <div className="clock" aria-label={`${c.timeLeft} ${left} giây`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9.5 2.5h5" /></svg>
          0:{String(left).padStart(2, '0')}
        </div>
      </div>
      <div className="screen__foot">
        <Button variant="secondary" onClick={() => finish(secs)}>{c.skip}</Button>
      </div>
    </div>
  )
}
