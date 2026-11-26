import { useEffect, useRef } from 'react'
import Button from '../components/Button.jsx'
import { challenge as c, SOLUTIONS } from '../content.js'
import { tasksFor, nextDay, canPlay, TOTAL_DAYS } from '../challenge.js'

const SHIFT = [0, 40, 60, 40, 0, -40, -60]

export default function Challenge({ state, today, allowSameDay, onStart, onAsk, onPlan, onResult, onClose }) {
  const next = nextDay(state)
  const doneCount = state.done.length + (state.final ? 1 : 0)
  const can = canPlay(state, today, { allowSameDay })
  const task = next && next < TOTAL_DAYS ? tasksFor(state.plan, SOLUTIONS)[next - 1].text : c.retestTask
  const nowRef = useRef(null)
  useEffect(() => { nowRef.current?.scrollIntoView?.({ block: 'center' }) }, [])

  const node = (day, x) => {
    const milestone = day === 7 || day === 14
    const st = next === null || day < next ? 'done' : day === next ? 'today' : 'locked'
    const big = st === 'today'
    const fill = st === 'done' ? 'var(--correct)' : st === 'today' ? 'var(--primary)' : 'var(--line)'
    const lip = st === 'done' ? 'var(--correct-lip)' : st === 'today' ? 'var(--primary-lip)' : '#CFCFCF'
    const size = big ? 64 : 48
    return (
      <div key={day} ref={big ? nowRef : null} data-day={day} data-state={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transform: `translateX(${x}px)` }}>
        {big && <div className="node__tag">{c.today}</div>}
        <div role="img" aria-label={c.nodeAria(day, st)} className={big ? 'node node--now' : 'node'} style={{ width: size, height: size, background: fill, boxShadow: `0 5px 0 ${lip}` }}>
          {st === 'done' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3D24" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
          {st === 'today' && <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--on-primary)' }}>{day}</span>}
          {st === 'locked' && day < TOTAL_DAYS && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>}
          {day === TOTAL_DAYS && st !== 'today' && st !== 'done' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>}
          {milestone && (
            <svg className="node__star" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" data-done={st === 'done' ? '1' : '0'}><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" /></svg>
          )}
        </div>
        {day === TOTAL_DAYS && <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--muted)' }}>{c.retestLabel}</div>}
      </div>
    )
  }

  const weeks = [1, 2, 3].map((w) => (
    <section key={w} className="week" aria-label={c.weekAria(w)}>
      <h2 className="week__head">{c.weekHeader(w)}</h2>
      <div className="path">{SHIFT.map((x, i) => node((w - 1) * 7 + i + 1, x))}</div>
    </section>
  ))

  return (
    <div className="screen">
      <div className="topbar" style={{ borderBottom: '2px solid var(--line)' }}>
        <button type="button" className="topbar__close" aria-label={c.close} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <h1 className="h2" style={{ flex: 1, lineHeight: 'normal', fontSize: 20, whiteSpace: 'nowrap' }}>{c.title}</h1>
        <div className="pill counter" aria-label={c.counterAria(doneCount)}>{c.counter(doneCount)}</div>
      </div>
      <div className="screen__body screen__body--tight" style={{ padding: '8px 20px' }}>
        {weeks}
      </div>
      <div className="screen__foot screen__foot--line chfoot" style={{ gap: 12 }}>
        {can.reason === 'finished' ? (
          <>
            <div className="chfoot__task" style={{ fontSize: 17 }}>{c.finished}</div>
            <div className="chfoot__row">
              <button type="button" className="linkbtn chfoot__plan" onClick={onPlan}>{c.viewPlan}</button>
              <Button variant="secondary" onClick={onAsk}>{c.ask}</Button>
              <Button onClick={onResult}>{c.seeResult}</Button>
            </div>
          </>
        ) : (
          <>
            <div className="chfoot__task" style={{ fontSize: 17 }}><b style={{ fontWeight: 800 }}>{c.todayTask}</b> {task}</div>
            {!can.ok && <p className="callout" role="status">{c.tomorrow}</p>}
            <div className="chfoot__row">
              <button type="button" className="linkbtn chfoot__plan" onClick={onPlan}>{c.viewPlan}</button>
              <Button variant="secondary" onClick={onAsk}>{c.ask}</Button>
              {can.ok ? (
                <Button onClick={onStart}>{next === TOTAL_DAYS ? c.startRetest : c.start}</Button>
              ) : (
                <button type="button" className="btn btn--disabled" disabled>{c.tomorrowBtn}</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
