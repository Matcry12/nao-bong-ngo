import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { content } from '../content.js'

const MAX_SECONDS = 60
const NOTIF_VISIBLE = 4
const VIDEO_MS = 3000

export default function ReadGame({ onFinish, onClose }) {
  const c = content.read
  const start = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [taps, setTaps] = useState(0)
  const [used, setUsed] = useState([]) // tapped notification indexes
  const [video, setVideo] = useState(false)
  const finished = useRef(false)

  const finish = (secs) => {
    if (finished.current) return
    finished.current = true
    onFinish({ notifTaps: taps, readingSeconds: Math.min(Math.round(secs), MAX_SECONDS) })
  }

  useEffect(() => {
    const id = setInterval(() => setElapsed((Date.now() - start.current) / 1000), 250)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (elapsed >= MAX_SECONDS && !video) finish(elapsed)
  })

  const activeIdx = c.notifications.findIndex(
    (n, i) => !used.includes(i) && elapsed >= n.at && elapsed < n.at + NOTIF_VISIBLE,
  )
  const active = activeIdx >= 0 ? c.notifications[activeIdx] : null

  const tapNotif = () => {
    setTaps((t) => t + 1)
    setUsed((u) => [...u, activeIdx])
    setVideo(true)
    setTimeout(() => setVideo(false), VIDEO_MS)
  }

  return (
    <div className="screen">
      <ProgressBar value={Math.min(100, 18 + (elapsed / MAX_SECONDS) * 7)} onClose={onClose} />
      <div className="screen__body" style={{ gap: 16, padding: '8px 20px 16px' }}>
        <h1 className="h2" style={{ lineHeight: 'normal' }}>{c.title}</h1>
        <div className="passage">
          {c.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
      {active && (
        <button type="button" className="notif" key={activeIdx} onClick={tapNotif}>
          <div className="notif__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z" />
              <path d="M10 21h4" />
            </svg>
          </div>
          <div className="notif__main">
            <div className="notif__head"><b>{active.who}</b><span>{active.time}</span></div>
            <div>{active.text}</div>
          </div>
        </button>
      )}
      <div className="screen__foot screen__foot--line">
        <Button onClick={() => finish((Date.now() - start.current) / 1000)}>{c.done}</Button>
      </div>
      {video && (
        <div className="video" role="status">
          <div className="video__play">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#3D2A00" aria-hidden="true"><path d="M8 5l11 7-11 7Z" /></svg>
          </div>
          <h1 className="h2">{c.videoTitle}</h1>
          <p style={{ fontSize: 17 }}>{c.videoSub}</p>
        </div>
      )}
    </div>
  )
}
