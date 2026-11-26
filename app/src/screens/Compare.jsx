import Button from '../components/Button.jsx'
import Mascot from '../components/Mascot.jsx'
import { compare as c, content } from '../content.js'
import { compare as compareState } from '../challenge.js'

const KEYS = ['focus', 'patience', 'switchUrge', 'phone']

export default function Compare({ state, onDone }) {
  const { before, after, delta } = compareState(state)
  const bars = {}
  KEYS.forEach((k) => { bars[k] = { before: state.day1.bars[k] ?? 0, after: state.final.bars[k] ?? 0 } })
  const drop = Math.abs(Math.round(delta))
  const kind = Math.round(delta) > 0 ? 'better' : Math.round(delta) < 0 ? 'worse' : 'same'
  const head = kind === 'better' ? c.better(drop) : c[kind]
  const sub = c[kind + 'Sub']
  const labels = content.result2.bars
  return (
    <div className="screen">
      <div className="topbar">
        <div style={{ width: 44, height: 44 }} aria-hidden="true" />
        <div className="eyebrow" style={{ flex: 1, textAlign: 'center', marginRight: 44 }}>{c.eyebrow}</div>
      </div>
      <div className="screen__body" style={{ gap: 24, padding: '8px 20px 16px' }}>
        <div className="cmp-top">
          <Mascot mood={kind === 'worse' ? 'worried' : 'proud'} size={96} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 className="h2" style={{ lineHeight: 1.3 }} data-kind={kind}>{head}</h1>
            <p className="sub" style={{ fontSize: 15 }}>{sub}</p>
          </div>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat__label">{c.before}</div>
            <div className="stat__num cmp-num">{Math.round(before)}<small>{c.scoreSuffix}</small></div>
          </div>
          <div className="stat" style={{ borderColor: kind === 'better' ? 'var(--correct)' : undefined }}>
            <div className="stat__label">{c.after}</div>
            <div className="stat__num cmp-num" style={{ color: kind === 'better' ? 'var(--correct-dark)' : undefined }}>{Math.round(after)}<small>{c.scoreSuffix}</small></div>
          </div>
        </div>
        <div className="bars" style={{ gap: 16 }}>
          <b style={{ fontWeight: 800, fontSize: 17 }}>{c.barsTitle}</b>
          {KEYS.map((k) => (
            <div key={k} data-bar={k}>
              <div className="bar__row"><b>{labels[k]}</b><span>{Math.round(bars[k].before)} → {Math.round(bars[k].after)}</span></div>
              <div className="pair">
                <div className="bar__track"><div className="bar__fill" style={{ width: bars[k].before + '%', background: '#CFCFCF' }} /></div>
                <div className="bar__track"><div className="bar__fill" style={{ width: bars[k].after + '%' }} /></div>
              </div>
            </div>
          ))}
        </div>
        <p className="small" style={{ textAlign: 'left' }}>{c.disclaimer}</p>
      </div>
      <div className="screen__foot screen__foot--line"><Button onClick={onDone}>{c.done}</Button></div>
    </div>
  )
}
