import { useRef, useState } from 'react'
import Button from '../components/Button.jsx'
import Mascot from '../components/Mascot.jsx'
import { content, resume, info } from '../content.js'

// saved: null | 'active' | 'finished'
export default function Start({ onNext, saved, onResume, onRestart, onSecret, consentOn, onSettings }) {
  const c = content.start
  const [ask, setAsk] = useState(false)
  const taps = useRef([])
  const tap = () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < 3000), now]
    if (taps.current.length >= 5) { taps.current = []; onSecret?.() }
  }
  return (
    <div className="screen">
      <div className="screen__body screen__body--center">
        <div onClick={tap} style={{ display: 'flex', justifyContent: 'center', cursor: 'default' }} data-secret="logo"><Mascot mood="calm" size={200} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 className="title">{c.title}</h1>
          <p className="sub">{c.sub}</p>
        </div>
      </div>
      <div className="screen__foot screen__foot--center">
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
        {onSettings && <button type="button" className="textbtn textbtn--small" data-testid="consent-link" onClick={onSettings}>{consentOn ? info.shareOn : info.shareOff}</button>}
      </div>
    </div>
  )
}
