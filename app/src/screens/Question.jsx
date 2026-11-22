import { useState } from 'react'
import Button from '../components/Button.jsx'
import ChoiceCard from '../components/ChoiceCard.jsx'
import FeedbackBanner from '../components/FeedbackBanner.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { content } from '../content.js'

export default function Question({ index, onAnswer, onClose }) {
  const questions = content.read.questions
  const q = questions[index]
  const [picked, setPicked] = useState(null)
  const [checked, setChecked] = useState(false)
  const right = picked === q.correct
  const progress = 25 + (index / questions.length) * 35

  return (
    <div className="screen">
      <ProgressBar value={progress} onClose={onClose} />
      <div className="screen__body" style={{ gap: 24, padding: '16px 20px' }}>
        <div className="eyebrow">CÂU {index + 1}/{questions.length}</div>
        <h1 className="h2">{q.q}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.options.map((label, i) => (
            <ChoiceCard key={i} selected={picked === i} onClick={() => !checked && setPicked(i)}>{label}</ChoiceCard>
          ))}
        </div>
      </div>
      {!checked && picked !== null && (
        <div className="screen__foot screen__foot--line">
          <Button onClick={() => setChecked(true)}>{content.common.check}</Button>
        </div>
      )}
      {checked && (
        <FeedbackBanner
          right={right}
          message={right ? q.right : q.wrong}
          note={right ? null : q.answer}
          onNext={() => onAnswer(right)}
        />
      )}
    </div>
  )
}
