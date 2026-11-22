import Button from '../components/Button.jsx'
import Mascot from '../components/Mascot.jsx'
import { content } from '../content.js'

export default function Start({ onNext }) {
  const c = content.start
  return (
    <div className="screen">
      <div className="screen__body screen__body--center">
        <Mascot mood="calm" size={200} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 className="title">{c.title}</h1>
          <p className="sub">{c.sub}</p>
        </div>
      </div>
      <div className="screen__foot">
        <Button onClick={onNext}>{c.cta}</Button>
        <p className="small">{c.disclaimer}</p>
      </div>
    </div>
  )
}
