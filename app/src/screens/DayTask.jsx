import { useState } from 'react'
import Button from '../components/Button.jsx'
import Mascot from '../components/Mascot.jsx'
import { dayTask as c } from '../content.js'
import { weekOf } from '../challenge.js'

export default function DayTask({ day, text, atRisk = false, onDone, onNotYet, onTell, onBack }) {
  const [celebrate, setCelebrate] = useState(false)
  const week = weekOf(day)
  const done = day % 7 === 0 && c.weekDone[week] ? c.weekDone[week] : c.done
  if (celebrate) {
    return (
      <div className="screen" style={{ background: 'var(--bg-soft)' }}>
        <div className="screen__body screen__body--center">
          <div className="pop"><Mascot mood="proud" size={done === c.done ? 180 : 200} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h1 className="title">{done.title}</h1>
            <p className="sub">{done.sub}</p>
          </div>
        </div>
        <div className="screen__foot"><Button onClick={onDone}>{done.cta}</Button></div>
      </div>
    )
  }
  return (
    <div className="screen">
      <div className="topbar">
        <button type="button" className="topbar__close" aria-label={c.back} onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="eyebrow" style={{ flex: 1, textAlign: 'center', marginRight: 44 }}>{c.eyebrow(day)} · {c.weekLabel(week)}</div>
      </div>
      <div className="screen__body screen__body--center" style={{ padding: '16px 20px' }}>
        <Mascot mood={atRisk ? 'worried' : 'calm'} size={140} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="eyebrow">{c.title}</div>
          <h1 className="title" style={{ lineHeight: 1.3 }}>{text}</h1>
        </div>
        <p className="callout" style={{ width: '100%' }}>{day % 7 === 0 ? c.lastOfWeek : c.questions[(day - 1) % c.questions.length]}</p>
        <button type="button" className="linkbtn" onClick={onTell}>{c.tell}</button>
      </div>
      <div className="screen__foot screen__foot--line" style={{ gap: 12 }}>
        <Button variant="correct" onClick={() => setCelebrate(true)}>{c.yes}</Button>
        <Button variant="secondary" onClick={onNotYet}>{c.no}</Button>
      </div>
    </div>
  )
}
