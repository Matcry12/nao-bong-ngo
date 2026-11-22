import { useState } from 'react'
import Button from '../components/Button.jsx'
import Mascot from '../components/Mascot.jsx'
import { content, resume } from '../content.js'

// saved: null | 'active' | 'finished'
export default function Start({ onNext, saved, onResume, onRestart }) {
  const c = content.start
  const [ask, setAsk] = useState(false)
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
        {saved === 'active' ? (
          ask ? (
            <>
              <p className="callout" role="alert">{resume.confirm}</p>
              <Button variant="danger" onClick={onRestart}>{resume.yes}</Button>
              <Button variant="secondary" onClick={() => setAsk(false)}>{resume.no}</Button>
            </>
          ) : (
            <>
              <Button onClick={onResume}>{resume.cta}</Button>
              <Button variant="secondary" onClick={() => setAsk(true)}>{resume.restart}</Button>
            </>
          )
        ) : (
          <>
            <Button onClick={onNext}>{c.cta}</Button>
            {saved === 'finished' && <Button variant="secondary" onClick={onResume}>{resume.seeResult}</Button>}
          </>
        )}
        <p className="small">{c.disclaimer}</p>
      </div>
    </div>
  )
}
