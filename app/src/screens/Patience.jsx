import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { content } from '../content.js'
import { SPEED } from '../speed.js'

export default function Patience({ progress, onFinish, onClose }) {
  const c = content.patience
  const [green, setGreen] = useState(false)
  const [early, setEarly] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    const wait = ((8 + Math.random() * 12) * 1000) / SPEED
    const id = setTimeout(() => setGreen(true), wait)
    return () => clearTimeout(id)
  }, [])

  const finish = (gaveUp, earlyTaps) => {
    if (done.current) return
    done.current = true
    onFinish({ earlyTaps, gaveUp })
  }
  const tap = () => {
    if (green) return finish(false, early)
    setEarly((n) => n + 1)
    setShakeKey((k) => k + 1)
  }

  return (
    <div className="screen">
      <ProgressBar value={progress} onClose={onClose} />
      <div className="screen__body screen__body--center" style={{ gap: 40 }}>
        <div className="eyebrow">{c.tag}</div>
        <button
          key={shakeKey}
          type="button"
          className={`dot ${green ? 'dot--go' : ''} ${shakeKey ? 'shake' : ''}`}
          aria-label={c.dotLabel}
          onClick={tap}
        >
          {green ? 'BẤM' : ''}
        </button>
        <h1 className="h2" role="status">{green ? c.go : c.wait}</h1>
      </div>
      <div className="screen__foot">
        <Button variant="ghost" onClick={() => finish(true, early)}>{c.giveUp}</Button>
      </div>
    </div>
  )
}
