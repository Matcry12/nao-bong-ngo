import Button from '../components/Button.jsx'
import Mascot from '../components/Mascot.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { content } from '../content.js'

export default function GameIntro({ onNext, onClose }) {
  const c = content.intro1
  return (
    <div className="screen">
      <ProgressBar value={10} onClose={onClose} />
      <div className="screen__body screen__body--center">
        <div className="pill">{c.tag}</div>
        <Mascot mood="calm" size={168} />
        <h1 className="h2" style={{ lineHeight: 1.35 }}>{c.title}</h1>
      </div>
      <div className="screen__foot">
        <Button onClick={onNext}>{c.cta}</Button>
      </div>
    </div>
  )
}
