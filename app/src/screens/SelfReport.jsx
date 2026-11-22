import { useState } from 'react'
import Button from '../components/Button.jsx'
import ChoiceCard from '../components/ChoiceCard.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { content } from '../content.js'

export default function SelfReport({ index, progress, onAnswer, onClose }) {
  const c = content.self
  const [picked, setPicked] = useState(null)
  return (
    <div className="screen">
      <ProgressBar value={progress} onClose={onClose} />
      <div className="screen__body" style={{ gap: 24, padding: '16px 20px' }}>
        <div className="eyebrow">{c.tag} · {index + 1}/{c.items.length}</div>
        <h1 className="h2">{c.items[index]}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {c.choices.map((label, i) => (
            <ChoiceCard key={i} selected={picked === i} onClick={() => setPicked(i)}>{label}</ChoiceCard>
          ))}
        </div>
      </div>
      {picked !== null && (
        <div className="screen__foot screen__foot--line">
          <Button onClick={() => onAnswer(picked)}>{content.common.next}</Button>
        </div>
      )}
    </div>
  )
}
