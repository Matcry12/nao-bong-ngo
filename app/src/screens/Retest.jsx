import Button from '../components/Button.jsx'
import Mascot from '../components/Mascot.jsx'
import PopcornBg from '../components/PopcornBg.jsx'
import { retest as c } from '../content.js'

export default function Retest({ onNext, onBack }) {
  return (
    <div className="screen">
      <PopcornBg />
      <div className="topbar">
        <button type="button" className="topbar__close" aria-label="Quay lại" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      </div>
      <div className="screen__body screen__body--center">
        <Mascot mood="calm" size={180} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="pill" style={{ alignSelf: 'center' }}>{c.eyebrow}</span>
          <h1 className="title">{c.title}</h1>
          <p className="sub">{c.sub}</p>
        </div>
      </div>
      <div className="screen__foot"><Button onClick={onNext}>{c.cta}</Button></div>
    </div>
  )
}
