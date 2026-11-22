import Button from '../components/Button.jsx'
import Mascot from '../components/Mascot.jsx'
import { content } from '../content.js'
import { levelFor } from '../scoring.js'

const COLORS = { low: 'var(--correct-dark)', medium: 'var(--warn-dark)', high: 'var(--danger-dark)' }

export default function Result1({ score, onReplay, onClose }) {
  const c = content.result
  const lv = levelFor(score)
  const n = { low: 1, medium: 2, high: 3 }[lv.key]
  const fill = lv.key === 'high' ? 'var(--danger)' : 'var(--primary)'
  const text = c.levels[lv.key]
  return (
    <div className="screen">
      <div className="topbar">
        <button type="button" className="topbar__close" aria-label={content.common.close} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="eyebrow" style={{ flex: 1, textAlign: 'center', marginRight: 44 }}>{c.eyebrow}</div>
      </div>
      <div className="screen__body screen__body--center" style={{ padding: '16px 20px' }}>
        <Mascot mood={lv.mood} size={200} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div className="eyebrow">{c.youAre}</div>
          <h1 className="title" style={{ lineHeight: 'normal' }}>{text.persona}</h1>
          <p className="sub" style={{ maxWidth: 300 }}>{text.line}</p>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat__label">{c.scoreLabel}</div>
            <div className="stat__num">{score}<small>/100</small></div>
          </div>
          <div className="stat" style={{ gap: 8 }}>
            <div className="stat__label">{c.levelLabel}</div>
            <div className="segs" aria-hidden="true">
              {[0, 1, 2].map((i) => <div key={i} className="seg" style={i < n ? { background: fill } : undefined} />)}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: COLORS[lv.key] }}>{lv.label}</div>
          </div>
        </div>
      </div>
      <div className="screen__foot">
        <Button onClick={onReplay}>{c.replay}</Button>
      </div>
    </div>
  )
}
