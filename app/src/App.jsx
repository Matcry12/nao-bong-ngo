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
import Scenario from './screens/Scenario.jsx'
import Plan from './screens/Plan.jsx'
import Coach from './screens/Coach.jsx'
import Celebrate from './screens/Celebrate.jsx'
import { content, level2, scenarios, reasonSolutions, barSolutions, SOLUTIONS, REASON_LABELS, GROUP_LABELS } from './content.js'
import { readGameRisk, patienceRisk, skipRisk, phoneDownRisk, selfReportScore, totalScore, breakdown, tallyReasons, topReasons, worstBar, buildPlan, levelFor } from './scoring.js'

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
  const [choices, setChoices] = useState([]) // level 2 weight objects
  const [plan, setPlan] = useState(null) // { top, plan }
  const [, setSaved] = useState(null)

  const home = () => setScreen('start')
  const merge = (patch, next) => { setRec((r) => ({ ...r, ...patch })); setScreen(next) }
  const replay = () => { setRec(EMPTY); setChoices([]); setPlan(null); setSaved(null); setIdx(0); setRun((r) => r + 1); setScreen('start') }

  const coachContext = () => {
    const r = results(rec)
    return {
      score: r.total,
      level: levelFor(r.total).label,
      bars: r.bars,
      reasons: plan.top.map((k) => REASON_LABELS[k]),
      plan: plan.plan.map((id) => ({ title: SOLUTIONS[id].title, group: GROUP_LABELS[SOLUTIONS[id].group] })),
      challengeDay: null,
    }
  }

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
    case 'result2': return <Result2 bars={results(rec).bars} onBack={() => setScreen('result1')} onNext={() => setScreen('intro5')} />
    case 'intro5': return <GameIntro data={level2.intro} progress={0} onNext={() => { setChoices([]); setIdx(0); setScreen('scenario') }} {...common} />
    case 'scenario':
      return (
        <Scenario key={idx} index={idx} {...common} onAnswer={(w) => {
          const all = [...choices, w]
          setChoices(all)
          if (idx + 1 < scenarios.length) { setIdx(idx + 1); return }
          const top = topReasons(tallyReasons(all))
          const worst = worstBar(results(rec).bars)
          setPlan({ top, plan: buildPlan({ top, worst, reasonSolutions, barSolutions, groupOf: Object.fromEntries(Object.entries(SOLUTIONS).map(([id, s]) => [id, s.group])) }) })
          setScreen('plan')
        }} />
      )
    case 'plan': return <Plan top={plan.top} plan={plan.plan} onSave={() => { setSaved(plan); setScreen('celebrate') }} onAsk={() => setScreen('coach')} {...common} />
    case 'coach': return <Coach context={coachContext()} onClose={() => setScreen('plan')} />
    default: return <Celebrate onReplay={replay} />
  }
}
