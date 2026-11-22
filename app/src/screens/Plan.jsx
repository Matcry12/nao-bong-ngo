import Button from '../components/Button.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { GROUP_LABELS, REASON_INFO, REASON_LABELS, SOLUTIONS, level2 } from '../content.js'

export default function Plan({ top, plan, onSave, onAsk, onClose, readOnly, onBack }) {
  const c = level2.plan
  return (
    <div className="screen">
      <ProgressBar value={100} onClose={onClose} />
      <div className="screen__body" style={{ gap: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 className="h2" style={{ lineHeight: 'normal' }}>{c.title}</h1>
          {top.map((r, i) => (
            <p key={r} style={{ fontSize: 17, lineHeight: 1.5 }}>
              <b style={{ fontWeight: 800 }}>{i === 0 ? c.main : c.second}</b> {REASON_LABELS[r]}.{i === 0 && ' ' + REASON_INFO[r]}
            </p>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plan.map((id) => {
            const s = SOLUTIONS[id]
            return (
              <div key={id} className="plan-card" data-solution={id}>
                <span className="tag">{GROUP_LABELS[s.group]}</span>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{s.title}</div>
                <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.4 }}>{s.detail}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div className={`screen__foot screen__foot--line ${readOnly ? '' : 'screen__foot--row'}`}>
        {readOnly ? <Button onClick={onBack}>{c.back}</Button> : (
          <>
            <Button onClick={onSave}>{c.save}</Button>
            <Button variant="secondary" onClick={onAsk}>{c.ask}</Button>
          </>
        )}
      </div>
    </div>
  )
}
