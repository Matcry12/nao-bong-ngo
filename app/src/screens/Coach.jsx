import { useEffect, useRef, useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import RichText from '../components/RichText.jsx'
import { coach } from '../content.js'
import { askCoach } from '../coach.js'
import { createLimiter } from '../coachSafety.js'

function makeLimiter() {
  try { return createLimiter({ storage: window.localStorage }) } catch { return null }
}

export default function Coach({ context, onClose }) {
  const [msgs, setMsgs] = useState([]) // { role, content, crisis?, local? }
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const limiter = useRef(null)
  if (limiter.current === null) limiter.current = makeLimiter() ?? false
  const [left, setLeft] = useState(() => (limiter.current ? limiter.current.remaining() : 20))
  const bodyRef = useRef(null)
  const started = useRef(false)
  const alive = useRef(true)

  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs, busy])

  const push = (m) => setMsgs((a) => [...a, m])

  useEffect(() => {
    if (started.current) return
    started.current = true
    setBusy(true)
    askCoach({ messages: [{ role: 'user', content: coach.openingPrompt }], context }).then((r) => {
      if (!alive.current) return
      if (r.reply) setMsgs([{ role: 'assistant', content: r.reply }])
      else setMsgs(coach.fallback.opening(context).map((content) => ({ role: 'assistant', content, local: true })))
      setBusy(false)
    })
  }, [context])

  async function send(raw) {
    const content = raw.trim().slice(0, 500)
    if (!content || busy || left <= 0) return
    setText('')
    const next = [...msgs, { role: 'user', content }]
    setMsgs(next)
    if (limiter.current) { limiter.current.consume(); setLeft(limiter.current.remaining()) }
    else setLeft((n) => n - 1)
    setBusy(true)
    const history = next.filter((m) => !m.local && !m.crisis).map(({ role, content: c }) => ({ role, content: c }))
    const r = await askCoach({ messages: history, context })
    if (!alive.current) return
    if (r.crisis) push({ role: 'assistant', crisis: true, local: true })
    else if (r.reply) push({ role: 'assistant', content: r.reply })
    else push({ role: 'assistant', content: coach.fallback.replies[content] ?? coach.fallback.generic, local: true })
    setBusy(false)
  }

  const out = left <= 0
  return (
    <div className="screen">
      <div className="topbar coach__head">
        <button type="button" className="topbar__close" aria-label={coach.close} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="coach__av"><Mascot mood="talk" size={40} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b className="coach__name">{coach.name}</b>
          <span className="small coach__sub">{coach.subtitle}</span>
        </div>
      </div>
      <div className="screen__body" ref={bodyRef} style={{ padding: '8px 20px 16px' }}>
        <div className="chat" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`bub ${m.role === 'user' ? 'bub--u' : 'bub--m'}`} data-crisis={m.crisis ? 'true' : undefined}>
              {m.crisis ? (
                <>
                  {coach.crisis.map((p) => <p key={p}>{p}</p>)}
                  <a className="coach__call" href={coach.hotline.href}>{coach.hotline.label}</a>
                </>
              ) : m.role === 'assistant' ? <RichText text={m.content} /> : m.content}
            </div>
          ))}
          {busy && <div className="bub bub--m typing" role="status" aria-label={coach.typing}><i /><i /><i /></div>}
        </div>
      </div>
      <div className="screen__foot screen__foot--line" style={{ gap: 12, paddingTop: 12 }}>
        <div className="coach__inner">
          {!out && (
            <div className="chips">
              {coach.chips.map((c) => (
                <button key={c} type="button" className="chip" disabled={busy} onClick={() => send(c)}>{c}</button>
              ))}
            </div>
          )}
          {out ? (
            <p className="callout" role="status">{coach.limitReached}</p>
          ) : (
            <>
              <form className="inp" onSubmit={(e) => { e.preventDefault(); send(text) }}>
                <input className="field" value={text} maxLength={500} placeholder={coach.placeholder} aria-label={coach.placeholder} onChange={(e) => setText(e.target.value)} />
                <button type="submit" className="send" aria-label={coach.send} disabled={busy || !text.trim()}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.5 20.5L22 12 2.5 3.5v6.3L14 12 2.5 14.2z" /></svg>
                </button>
              </form>
              {left <= 5 && <p className="small" role="status" style={{ marginTop: 8 }}>{coach.remaining(left)}</p>}
            </>
          )}
          <p className="small" style={{ marginTop: 8 }}>{coach.note}</p>
        </div>
      </div>
    </div>
  )
}
