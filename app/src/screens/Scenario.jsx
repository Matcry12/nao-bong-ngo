import { useState } from 'react'
import Button from '../components/Button.jsx'
import ChoiceCard from '../components/ChoiceCard.jsx'
import ScenarioArt from '../components/ScenarioArt.jsx'
import { content, level2, scenarios } from '../content.js'

export default function Scenario({ index, onAnswer, onClose }) {
  const s = scenarios[index]
  const total = scenarios.length
  const [picked, setPicked] = useState(null)
  const c = level2.scenario
  return (
    <div className="screen">
      <div className="topbar">
        <button type="button" className="topbar__close" aria-label={content.common.close} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="progress" role="progressbar" aria-label={`${c.aria} ${index + 1} trên ${total}`} aria-valuenow={index + 1} aria-valuemin="0" aria-valuemax={total}>
          <div className="progress__fill" style={{ width: ((index + 1) / total) * 100 + '%' }} />
        </div>
        <div className="eyebrow">{index + 1}/{total}</div>
      </div>
      <div className="screen__body" style={{ gap: 20, padding: '8px 20px 16px' }}>
        <ScenarioArt icon={s.icon} />
        <div className="eyebrow">{c.aria} {index + 1}/{total} · {s.title}</div>
        <h1 className="h2">{s.text}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {s.choices.map((ch, i) => (
            <ChoiceCard key={i} selected={picked === i} onClick={() => setPicked(i)}>{ch.text}</ChoiceCard>
          ))}
        </div>
      </div>
      {picked !== null && (
        <div className="screen__foot screen__foot--line">
          <Button onClick={() => onAnswer(s.choices[picked].w)}>{c.next}</Button>
        </div>
      )}
    </div>
  )
}
