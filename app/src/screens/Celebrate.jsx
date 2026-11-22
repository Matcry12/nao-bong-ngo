import Button from '../components/Button.jsx'
import Mascot from '../components/Mascot.jsx'
import { level2 } from '../content.js'

export default function Celebrate({ onReplay }) {
  const c = level2.celebrate
  return (
    <div className="screen" style={{ background: 'var(--bg-soft)' }}>
      <div className="screen__body screen__body--center">
        <div className="pop"><Mascot mood="proud" size={220} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 className="title">{c.title}</h1>
          <p className="sub">{c.sub}</p>
        </div>
      </div>
      <div className="screen__foot">
        <Button onClick={onReplay}>{c.cta}</Button>
      </div>
    </div>
  )
}
