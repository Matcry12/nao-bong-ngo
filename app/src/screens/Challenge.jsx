import { useEffect, useRef } from 'react'
import Button from '../components/Button.jsx'
import { challenge as c, SOLUTIONS } from '../content.js'
import { tasksFor, nextDay, canPlay } from '../challenge.js'

const SHIFT = [0, 56, 84, 56, 0, -56, -84]

export default function Challenge({ state, today, allowSameDay, onStart, onAsk, onPlan, onResult, onClose }) {
  const next = nextDay(state)
  const doneCount = state.done.length + (state.day7 ? 1 : 0)
  const can = canPlay(state, today, { allowSameDay })
  const task = next && next < 7 ? tasksFor(state.plan, SOLUTIONS)[next - 1].text : c.retestTask
  const nowRef = useRef(null)
  useEffect(() => { nowRef.current?.scrollIntoView?.({ block: 'center' }) }, [])

  const nodes = SHIFT.map((x, i) => {
    const day = i + 1
    const st = next === null || day < next ? 'done' : day === next ? 'today' : 'locked'
    const big = st === 'today'
    const fill = st === 'done' ? 'var(--correct)' : st === 'today' ? 'var(--primary)' : 'var(--line)'
    const lip = st === 'done' ? 'var(--correct-lip)' : st === 'today' ? 'var(--primary-lip)' : '#CFCFCF'
    const size = big ? 76 : 60
    return (
      <div key={day} ref={big ? nowRef : null} data-day={day} data-state={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transform: `translateX(${x}px)` }}>
        {big && <div className="node__tag">{c.today}</div>}
        <div role="img" aria-label={c.nodeAria(day, st)} className={big ? 'node node--now' : 'node'} style={{ width: size, height: size, background: fill, boxShadow: `0 5px 0 ${lip}` }}>
          {st === 'done' && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0F3D24" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
          {st === 'today' && <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--on-primary)' }}>{day}</span>}
          {st === 'locked' && day < 7 && <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>}
          {day === 7 && st !== 'today' && st !== 'done' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>}
          {day === 7 && st === 'done' && null}
        </div>
        {day === 7 && <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--muted)' }}>{c.retestLabel}</div>}
      </div>
    )
  })

  return (
    <div className="screen">
      <div className="topbar" style={{ borderBottom: '2px solid var(--line)' }}>
        <button type="button" className="topbar__close" aria-label={c.close} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <h1 className="h2" style={{ flex: 1, lineHeight: 'normal' }}>{c.title}</h1>
        <div className="pill counter" aria-label={c.counterAria(doneCount)}>{c.counter(doneCount)}</div>
      </div>
      <div className="screen__body" style={{ padding: '16px 20px' }}>
        <div className="path">{nodes}</div>
      </div>
      <div className="screen__foot screen__foot--line" style={{ gap: 12 }}>
        {can.reason === 'finished' ? (
          <>
            <div style={{ fontSize: 17 }}>{c.finished}</div>
            <Button onClick={onResult}>{c.seeResult}</Button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 17 }}><b style={{ fontWeight: 800 }}>{c.todayTask}</b> {task}</div>
            {can.ok ? (
              <Button onClick={onStart}>{next === 7 ? c.startRetest : c.start}</Button>
            ) : (
              <>
                <p className="callout" role="status">{c.tomorrow}</p>
                <button type="button" className="btn btn--disabled" disabled>{c.tomorrowBtn}</button>
              </>
            )}
          </>
        )}
        <div className="foot-row">
          <Button variant="secondary" onClick={onAsk}>{c.ask}</Button>
          <button type="button" className="linkbtn" onClick={onPlan}>{c.viewPlan}</button>
        </div>
      </div>
    </div>
  )
}
