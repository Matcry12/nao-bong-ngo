import { Fragment, useState } from 'react'
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
import Challenge from './screens/Challenge.jsx'
import DayTask from './screens/DayTask.jsx'
import Retest from './screens/Retest.jsx'
import Compare from './screens/Compare.jsx'
import Info from './screens/Info.jsx'
import Demo from './screens/Demo.jsx'
import { getClientId, loadConsent, saveConsent, buildRow, sendRow } from './research.js'
import { SPEED } from './speed.js'
import { toDateKey, createChallenge, tasksFor, nextDay, streakAtRisk, completeDay, recordRetest, TOTAL_DAYS, loadChallenge, saveChallenge, clearChallenge } from './challenge.js'
import { content, level2, challengeEnd, scenarios, reasonSolutions, barSolutions, SOLUTIONS, REASON_LABELS, GROUP_LABELS } from './content.js'
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

const store = () => { try { return window.localStorage } catch { return null } }
const SHEET_URL = import.meta.env.VITE_SHEET_URL || ''
const SEEN_KEY = 'nbn:info:seen'
const DEMO = typeof location !== 'undefined' && new URLSearchParams(location.search).get('demo') === '1'
const FAST = SPEED > 1 // ?fast=1 lets testers play several days in one sitting

export default function App() {
  const [ch, setCh] = useState(() => { const st = store(); return st ? loadChallenge(st) : null })
  const [mode, setMode] = useState('first') // 'first' | 'retest'
  const [coachBack, setCoachBack] = useState('plan')
  const [coachDay, setCoachDay] = useState(null)
  const [day, setDay] = useState(1)
  const [screen, setScreen] = useState(DEMO ? 'demo' : 'start')
  const [idx, setIdx] = useState(0) // question / self-report index
  const [run, setRun] = useState(0) // remount key for replays
  const [rec, setRec] = useState(EMPTY)
  const [choices, setChoices] = useState([]) // level 2 weight objects
  const [plan, setPlan] = useState(null) // { top, plan }
  const [, setSaved] = useState(null)

  // Opt-in upload: fire-and-forget, only with consent + sheet URL
  const upload = (dayNo, r, top, planIds) => {
    const st = store()
    if (!SHEET_URL || !st) return
    const { consent, info } = loadConsent(st)
    if (!consent) return
    sendRow(SHEET_URL, buildRow({
      clientId: getClientId(st), day: dayNo, info, total: r.total, level: levelFor(r.total).label, bars: r.bars,
      reasons: top.map((k) => REASON_LABELS[k]), plan: planIds.map((id) => SOLUTIONS[id].title),
    }))
  }
  const beginRun = () => {
    const st = store()
    let seen = false
    try { seen = !!st && st.getItem(SEEN_KEY) === '1' } catch { /* ignore */ }
    setMode('first'); setRec(EMPTY); setRun((r) => r + 1); setScreen(seen ? 'intro1' : 'info')
  }
  const markSeen = () => { try { store()?.setItem(SEEN_KEY, '1') } catch { /* ignore */ } }

  const opts = { allowSameDay: FAST }
  const persist = (next) => { setCh(next); const st = store(); if (st) saveChallenge(st, next) }
  const home = () => setScreen(mode === 'retest' && ch ? 'challenge' : 'start')
  const merge = (patch, next) => { setRec((r) => ({ ...r, ...patch })); setScreen(next) }
  const replay = () => { setMode('first'); setRec(EMPTY); setChoices([]); setPlan(null); setSaved(null); setIdx(0); setRun((r) => r + 1); setScreen('start') }

  const coachContext = () => {
    // Saved challenge (survives reload) wins; before saving, use the in-memory run
    const src = ch
      ? { score: ch.day1.score, bars: ch.day1.bars, top: ch.top, ids: ch.plan }
      : (() => { const r = results(rec); return { score: r.total, bars: r.bars, top: plan.top, ids: plan.plan } })()
    return {
      score: src.score,
      level: levelFor(src.score).label,
      bars: src.bars,
      reasons: src.top.map((k) => REASON_LABELS[k]),
      plan: src.ids.map((id) => ({ title: SOLUTIONS[id].title, group: GROUP_LABELS[SOLUTIONS[id].group] })),
      challengeDay: coachDay,
    }
  }
  const askCoachFrom = (back, d) => { setCoachBack(back); setCoachDay(d); setScreen('coach') }
  const finished = ch ? nextDay(ch) === null : false

  const common = { onClose: home }
  return <Fragment key={screen}>{renderScreen()}</Fragment>

  function renderScreen() {
  switch (screen) {
    case 'start':
      return (
        <Start
          saved={ch ? (finished ? 'finished' : 'active') : null}
          onNext={beginRun}
          onSecret={() => setScreen('demo')}
          consentOn={(() => { const st = store(); return st ? loadConsent(st).consent : false })()}
          onSettings={() => setScreen('settings')}
          onResume={() => setScreen(finished ? 'compare' : 'challenge')}
          onRestart={() => { const st = store(); if (st) clearChallenge(st); setCh(null); beginRun() }}
        />
      )
    case 'demo': return <Demo onClose={() => setScreen('start')} />
    case 'settings':
      return (
        <Info settings initial={(() => { const st = store(); return st ? loadConsent(st) : null })()} onClose={() => setScreen('start')}
          onDone={(v) => { const st = store(); if (st) saveConsent(st, v); markSeen(); setScreen('start') }} />
      )
    case 'info':
      return (
        <Info initial={(() => { const st = store(); return st ? loadConsent(st) : null })()} onClose={() => setScreen('start')}
          onSkip={() => { markSeen(); setScreen('intro1') }}
          onDone={(v) => { const st = store(); if (st) saveConsent(st, v); markSeen(); setScreen('intro1') }} />
      )
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
          else if (mode === 'retest') {
            const r = results({ ...rec, selfAnswers: [...rec.selfAnswers, a] })
            const next = recordRetest(ch, { score: r.total, bars: r.bars }, toDateKey(), opts)
            persist(next)
            if (next.final) upload(TOTAL_DAYS, r, ch.top, ch.plan)
            setScreen('compare')
          } else setScreen('result1')
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
    case 'plan':
      return <Plan top={plan.top} plan={plan.plan} {...common} onAsk={() => askCoachFrom('plan', null)} onSave={() => {
        const r = results(rec)
        setSaved(plan)
        setMode('first')
        upload(1, r, plan.top, plan.plan)
        persist(createChallenge({ plan: plan.plan, top: plan.top, score: r.total, bars: r.bars, today: toDateKey() }))
        setScreen('celebrate')
      }} />
    case 'planview': return <Plan top={ch.top} plan={ch.plan} readOnly onBack={() => setScreen('challenge')} onClose={() => setScreen('challenge')} />
    case 'coach': return <Coach context={coachContext()} onClose={() => setScreen(coachBack)} />
    case 'challenge':
      return (
        <Challenge state={ch} today={toDateKey()} allowSameDay={FAST} onClose={() => setScreen('start')}
          onAsk={() => askCoachFrom('challenge', nextDay(ch) ?? TOTAL_DAYS)} onPlan={() => setScreen('planview')} onResult={() => setScreen('compare')}
          onStart={() => { const n = nextDay(ch); setDay(n); setMode('first'); setScreen(n === TOTAL_DAYS ? 'retestIntro' : 'daytask') }} />
      )
    case 'daytask':
      return (
        <DayTask day={day} text={tasksFor(ch.plan, SOLUTIONS)[day - 1].text} atRisk={streakAtRisk(ch, toDateKey())}
          onBack={() => setScreen('challenge')} onNotYet={() => setScreen('challenge')}
          onTell={() => askCoachFrom('daytask', day)}
          onDone={() => { persist(completeDay(ch, day, toDateKey(), opts)); setScreen('challenge') }} />
      )
    case 'retestIntro':
      return <Retest onBack={() => setScreen('challenge')} onNext={() => { setMode('retest'); setRec(EMPTY); setIdx(0); setRun((r) => r + 1); setScreen('intro1') }} />
    case 'compare': return <Compare state={ch} onDone={() => { setScreen(mode === 'retest' ? 'end' : 'start'); setMode('first') }} />
    case 'end': return <Celebrate data={challengeEnd} onNext={() => setScreen('start')} />
    default: return <Celebrate onNext={() => setScreen('challenge')} />
  }
  }
}
