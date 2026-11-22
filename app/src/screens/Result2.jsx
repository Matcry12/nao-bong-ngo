import Button from '../components/Button.jsx'
import { content } from '../content.js'

export default function Result2({ bars, onNext, onBack }) {
  const c = content.result2
  const top = Object.keys(bars).reduce((a, k) => (bars[k] > bars[a] ? k : a), 'focus')
  return (
    <div className="screen">
      <div className="topbar">
        <button type="button" className="topbar__close" aria-label={c.back} onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="eyebrow" style={{ flex: 1, textAlign: 'center', marginRight: 44 }}>{c.eyebrow}</div>
      </div>
      <div className="screen__body" style={{ gap: 24, padding: '16px 20px' }}>
        <h1 className="h2" style={{ lineHeight: 'normal' }}>{c.title}</h1>
        <div className="bars">
          {['focus', 'patience', 'switchUrge', 'phone'].map((k, i) => (
            <div key={k}>
              <div className="bar__row"><b>{c.bars[k]}</b><span>{bars[k]}/100</span></div>
              <div className="bar__track"><div className="bar__fill bar__fill--grow" style={{ '--i': i, width: bars[k] + '%', background: bars[k] >= 70 ? 'var(--danger)' : undefined }} /></div>
            </div>
          ))}
        </div>
        <p className="small" style={{ textAlign: 'left', marginTop: -8 }}>{c.caption}</p>
        <div className="callout">{c.survey[top]}</div>
        <p className="small" style={{ textAlign: 'left' }}>{c.disclaimer}</p>
      </div>
      <div className="screen__foot screen__foot--line">
        <Button onClick={onNext}>{c.toLevel2}</Button>
      </div>
    </div>
  )
}
