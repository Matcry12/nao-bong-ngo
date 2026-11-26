import { useEffect, useState } from 'react'
import Start from './Start.jsx'
import ReadGame from './ReadGame.jsx'
import Question from './Question.jsx'
import Patience from './Patience.jsx'
import Skip from './Skip.jsx'
import PhoneDown from './PhoneDown.jsx'
import SelfReport from './SelfReport.jsx'
import Result1 from './Result1.jsx'
import Result2 from './Result2.jsx'
import Scenario from './Scenario.jsx'
import Plan from './Plan.jsx'
import Coach from './Coach.jsx'
import Challenge from './Challenge.jsx'
import DayTask from './DayTask.jsx'
import Compare from './Compare.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import Button from '../components/Button.jsx'
import { demo as c, content, SOLUTIONS, REASON_LABELS, GROUP_LABELS } from '../content.js'
import { createChallenge, completeDay, nextDay, tasksFor, toDateKey, TOTAL_DAYS } from '../challenge.js'
import { levelFor } from '../scoring.js'
import { fetchSummary } from '../research.js'

const SHEET_URL = import.meta.env.VITE_SHEET_URL || ''
const QCOUNT = content.read.questions.length
const NSELF = content.self.items.length

const SAMPLE = {
  top: ['habit', 'fomo'],
  plan: ['notifOff', 'fixedChecks', 'studyBag'],
  day1: { score: 62, bars: { focus: 72, patience: 55, switchUrge: 64, phone: 48 } },
  final: { score: 44, bars: { focus: 50, patience: 42, switchUrge: 45, phone: 38 } },
}
const sampleChallenge = () => {
  const today = toDateKey()
  let s = createChallenge({ plan: SAMPLE.plan, top: SAMPLE.top, score: SAMPLE.day1.score, bars: SAMPLE.day1.bars, today })
  for (const d of [1, 2, 3]) s = completeDay(s, d, today, { allowSameDay: true })
  return s
}
const sampleContext = (day = null) => ({
  score: SAMPLE.day1.score,
  level: levelFor(SAMPLE.day1.score).label,
  bars: SAMPLE.day1.bars,
  reasons: SAMPLE.top.map((k) => REASON_LABELS[k]),
  plan: SAMPLE.plan.map((id) => ({ title: SOLUTIONS[id].title, group: GROUP_LABELS[SOLUTIONS[id].group] })),
  challengeDay: day,
})

const fmt = (n, d = 1) => (typeof n === 'number' && Number.isFinite(n) ? n.toFixed(d).replace('.', ',') : '–')

function HBars({ items, max = 100, fmtVal }) {
  return items.map(([label, v]) => (
    <div className="hbar" key={label}>
      <div className="hbar__row"><span>{label}</span><span>{fmtVal(v)}</span></div>
      <div className="bar__track"><div className="bar__fill" style={{ width: Math.min(100, (v / max) * 100) + '%' }} /></div>
    </div>
  ))
}

function AppData() {
  const a = c.appData
  const [st, setSt] = useState(SHEET_URL ? 'loading' : 'none')
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!SHEET_URL) return undefined
    let alive = true
    fetchSummary(SHEET_URL).then((s) => { if (alive) { setData(s); setSt(s ? 'ok' : 'none') } }).catch(() => { if (alive) setSt('none') })
    return () => { alive = false }
  }, [])
  return (
    <section className="demo-sec" data-testid="app-data">
      <h2>{a.title}</h2>
      {st === 'loading' && <p className="callout">{a.loading}</p>}
      {st === 'none' && <p className="callout">{a.none}</p>}
      {st === 'ok' && data && (
        <div className="kv">
          <div className="stat"><div className="stat__label">{a.count}</div><div className="stat__num">{data.count ?? 0}</div></div>
          <div className="stat"><div className="stat__label">{a.pairs}</div><div className="stat__num">{data.pairs ?? 0}</div></div>
          <div className="stat"><div className="stat__label">{a.avg1}</div><div className="stat__num">{fmt(data.avgDay1)}</div></div>
          <div className="stat"><div className="stat__label">{a.avg7}</div><div className="stat__num">{fmt(data.avgFinal ?? data.avgDay7)}</div></div>
          <div className="stat" style={{ gridColumn: '1 / -1' }}><div className="stat__label">{a.delta}</div><div className="stat__num">{fmt(data.avgDelta)}</div></div>
        </div>
      )}
    </section>
  )
}

// Jumps stay inside this component and return to the menu; nothing touches the real run or saved challenge.
export default function Demo({ onClose }) {
  const [view, setView] = useState('menu')
  const [idx, setIdx] = useState(0)
  const [ch, setCh] = useState(sampleChallenge) // in memory only
  const [coachBack, setCoachBack] = useState('menu')
  const [coachDay, setCoachDay] = useState(null)
  const [dayN, setDayN] = useState(4)
  const menu = () => { setIdx(0); setView('menu') }
  const go = (v) => { setIdx(0); setView(v) }
  const common = { onClose: menu }
  const today = toDateKey()

  switch (view) {
    case 'start': return <Start saved={null} onNext={menu} onResume={menu} onRestart={menu} />
    case 'read': return <ReadGame {...common} onFinish={() => go('question')} />
    case 'question':
      return <Question key={idx} index={idx} {...common} onAnswer={() => (idx + 1 < QCOUNT ? setIdx(idx + 1) : menu())} />
    case 'patience': return <Patience progress={28} {...common} onFinish={menu} />
    case 'skip': return <Skip progress={40} {...common} onFinish={menu} />
    case 'phone': return <PhoneDown progress={54} {...common} onFinish={menu} />
    case 'self':
      return <SelfReport key={idx} index={idx} progress={68 + idx * 5} {...common} onAnswer={() => (idx + 1 < NSELF ? setIdx(idx + 1) : menu())} />
    case 'result1': return <Result1 score={SAMPLE.day1.score} onNext={() => go('result2')} {...common} />
    case 'result2': return <Result2 bars={SAMPLE.day1.bars} onBack={() => go('result1')} onNext={menu} />
    case 'scenario': return <Scenario index={0} {...common} onAnswer={menu} />
    case 'plan':
      return <Plan top={SAMPLE.top} plan={SAMPLE.plan} {...common} onSave={menu} onAsk={() => { setCoachBack('plan'); setCoachDay(null); go('coach') }} />
    case 'coach': return <Coach context={sampleContext(coachDay)} onClose={() => go(coachBack)} />
    case 'challenge':
      return (
        <Challenge state={ch} today={today} allowSameDay onClose={menu}
          onAsk={() => { setCoachBack('challenge'); setCoachDay(nextDay(ch) ?? 21); go('coach') }}
          onPlan={() => go('plan')} onResult={() => go('compare')}
          onStart={() => { const n = nextDay(ch); if (n === TOTAL_DAYS) go('compare'); else { setDayN(n); go('daytask') } }} />
      )
    case 'daytask':
      return (
        <DayTask day={dayN} text={tasksFor(ch.plan, SOLUTIONS)[dayN - 1].text}
          onBack={() => go('challenge')} onNotYet={() => go('challenge')}
          onTell={() => { setCoachBack('daytask'); setCoachDay(dayN); go('coach') }}
          onDone={() => { setCh(completeDay(ch, dayN, today, { allowSameDay: true })); go('challenge') }} />
      )
    case 'compare': return <Compare state={{ ...ch, day1: SAMPLE.day1, final: SAMPLE.final }} onDone={menu} />
    default: break
  }

  return (
    <div className="screen" data-screen="demo">
      <ProgressBar value={0} onClose={onClose} />
      <div className="screen__body" style={{ gap: 24, padding: '8px 20px 24px' }}>
        <h1 className="h2">{c.title}</h1>
        <nav className="demo-grid" aria-label={c.jumpsAria}>
          {c.jumps.map(([id, label]) => (
            <button key={id} type="button" className="demo-jump" data-jump={id} onClick={() => go(id)}>{label}</button>
          ))}
        </nav>
        <section className="demo-sec" data-testid="survey">
          <h2>{c.surveyTitle}</h2>
          <h3>{c.awareness.title}</h3>
          <div><HBars items={c.awareness.items} fmtVal={(v) => fmt(v, 2) + '%'} /></div>
          <h3>{c.freq.title}</h3>
          <div><HBars items={c.freq.items} fmtVal={(v) => fmt(v, 1) + '%'} /></div>
          <h3>{c.symptoms.title}</h3>
          <div><HBars items={c.symptoms.items} max={c.symptoms.total} fmtVal={(v) => `${v}/${c.symptoms.total}`} /></div>
        </section>
        <AppData />
      </div>
      <div className="screen__foot screen__foot--line"><Button variant="secondary" onClick={onClose}>{c.close}</Button></div>
    </div>
  )
}
