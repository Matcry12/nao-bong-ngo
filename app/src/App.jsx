import { useState } from 'react'
import Start from './screens/Start.jsx'
import GameIntro from './screens/GameIntro.jsx'
import ReadGame from './screens/ReadGame.jsx'
import Question from './screens/Question.jsx'
import Result1 from './screens/Result1.jsx'
import { content } from './content.js'
import { readGameRisk } from './scoring.js'

const QCOUNT = content.read.questions.length

export default function App() {
  const [screen, setScreen] = useState('start')
  const [qIndex, setQIndex] = useState(0)
  const [run, setRun] = useState(0) // remount key for replays
  const [rec, setRec] = useState({ notifTaps: 0, readingSeconds: 0, correctAnswers: 0 })

  const home = () => { setScreen('start') }
  const answer = (right) => {
    const next = { ...rec, correctAnswers: rec.correctAnswers + (right ? 1 : 0) }
    setRec(next)
    if (qIndex + 1 < QCOUNT) setQIndex(qIndex + 1)
    else setScreen('result')
  }
  const replay = () => {
    setRec({ notifTaps: 0, readingSeconds: 0, correctAnswers: 0 })
    setQIndex(0)
    setRun((r) => r + 1)
    setScreen('intro1')
  }

  if (screen === 'start') return <Start onNext={() => setScreen('intro1')} />
  if (screen === 'intro1') return <GameIntro onNext={() => setScreen('read')} onClose={home} />
  if (screen === 'read')
    return (
      <ReadGame
        key={run}
        onClose={home}
        onFinish={({ notifTaps, readingSeconds }) => {
          setRec({ notifTaps, readingSeconds, correctAnswers: 0 })
          setQIndex(0)
          setScreen('question')
        }}
      />
    )
  if (screen === 'question') return <Question key={qIndex} index={qIndex} onAnswer={answer} onClose={home} />
  const score = readGameRisk({ notifTaps: rec.notifTaps, wrong: QCOUNT - rec.correctAnswers })
  return <Result1 score={score} onReplay={replay} onClose={home} />
}
