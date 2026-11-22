import { useState } from 'react'
import Start from './screens/Start.jsx'
import GameIntro from './screens/GameIntro.jsx'
import ReadGame from './screens/ReadGame.jsx'
import Question from './screens/Question.jsx'
import Patience from './screens/Patience.jsx'
import Skip from './screens/Skip.jsx'
import PhoneDown from './screens/PhoneDown.jsx'
import SelfReport from './screens/SelfReport.jsx'
import Result1 from './screens/Result1.jsx'
import Result2 from './screens/Result2.jsx'
import { content } from './content.js'
import { readGameRisk, patienceRisk, skipRisk, phoneDownRisk, selfReportScore, totalScore, breakdown } from './scoring.js'

const QCOUNT = content.read.questions.length
const NSELF = content.self.items.length
const EMPTY = { notifTaps: 0, readingSeconds: 0, correct: 0, earlyTaps: 0, gaveUp: false, secondsWatched: 0, touches: 0, selfAnswers: [] }

function results(rec) {
  const read = readGameRisk({ notifTaps: rec.notifTaps, wrong: QCOUNT - rec.correct, readingSeconds: rec.readingSeconds })
  const patience = patienceRisk({ earlyTaps: rec.earlyTaps, gaveUp: rec.gaveUp })
  const skip = skipRisk({ secondsWatched: rec.secondsWatched })
  const phone = phoneDownRisk({ touches: rec.touches })
  const self = selfReportScore(rec.selfAnswers)
  return {
    total: totalScore({ read, patience, skip, phone, self }),
    bars: breakdown({ read, patience, skip, phone, selfAnswers: rec.selfAnswers }),
  }
}

export default function App() {
  const [screen, setScreen] = useState('start')
  const [idx, setIdx] = useState(0) // question / self-report index
  const [run, setRun] = useState(0) // remount key for replays
  const [rec, setRec] = useState(EMPTY)

  const home = () => setScreen('start')
  const merge = (patch, next) => { setRec((r) => ({ ...r, ...patch })); setScreen(next) }
  const replay = () => { setRec(EMPTY); setIdx(0); setRun((r) => r + 1); setScreen('start') }

  const common = { onClose: home }
  switch (screen) {
    case 'start': return <Start onNext={() => { setRec(EMPTY); setRun((r) => r + 1); setScreen('intro1') }} />
    case 'intro1': return <GameIntro index={0} progress={4} onNext={() => setScreen('read')} {...common} />
    case 'read':
      return <ReadGame key={run} {...common} onFinish={({ notifTaps, readingSeconds }) => { setIdx(0); merge({ notifTaps, readingSeconds, correct: 0 }, 'question') }} />
    case 'question':
      return (
        <Question key={idx} index={idx} {...common} onAnswer={(right) => {
          setRec((r) => ({ ...r, correct: r.correct + (right ? 1 : 0) }))
          if (idx + 1 < QCOUNT) setIdx(idx + 1)
          else setScreen('intro2')
        }} />
      )
    case 'intro2': return <GameIntro index={1} progress={26} onNext={() => setScreen('patience')} {...common} />
    case 'patience': return <Patience progress={28} {...common} onFinish={(p) => merge(p, 'intro3')} />
    case 'intro3': return <GameIntro index={2} progress={38} onNext={() => setScreen('skip')} {...common} />
    case 'skip': return <Skip progress={40} {...common} onFinish={(p) => merge(p, 'intro4')} />
    case 'intro4': return <GameIntro index={3} progress={52} onNext={() => setScreen('phone')} {...common} />
    case 'phone': return <PhoneDown progress={54} {...common} onFinish={(p) => { setIdx(0); merge(p, 'self') }} />
    case 'self':
      return (
        <SelfReport key={idx} index={idx} progress={68 + idx * 5} {...common} onAnswer={(a) => {
          setRec((r) => ({ ...r, selfAnswers: [...r.selfAnswers, a] }))
          if (idx + 1 < NSELF) setIdx(idx + 1)
          else setScreen('result1')
        }} />
      )
    case 'result1': return <Result1 score={results(rec).total} onNext={() => setScreen('result2')} {...common} />
    default: return <Result2 bars={results(rec).bars} onBack={() => setScreen('result1')} onReplay={replay} />
  }
}
