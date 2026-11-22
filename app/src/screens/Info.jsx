import { useState } from 'react'
import Button from '../components/Button.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { SCHOOLS, info as c } from '../content.js'

export default function Info({ initial, settings, onDone, onSkip, onClose }) {
  const [school, setSchool] = useState(initial?.info?.school ?? '')
  const [grade, setGrade] = useState(initial?.info?.grade ?? '')
  const [gender, setGender] = useState(initial?.info?.gender ?? '')
  const [consent, setConsent] = useState(!!initial?.consent)
  return (
    <div className="screen">
      <ProgressBar value={5} onClose={onClose} />
      <div className="screen__body" style={{ gap: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 className="h2">{c.title}</h1>
          <p className="sub" style={{ fontSize: 15 }}>{c.sub}</p>
        </div>
        <div className="fld">
          <label htmlFor="truong">{c.school}</label>
          <select id="truong" className="select" value={school} onChange={(e) => setSchool(e.target.value)}>
            <option value="">{c.schoolPlaceholder}</option>
            {SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value={c.schoolOther}>{c.schoolOther}</option>
          </select>
        </div>
        <div className="fld">
          <label htmlFor="lop">{c.grade}</label>
          <select id="lop" className="select" value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">{c.gradePlaceholder}</option>
            {c.grades.map((g) => <option key={g} value={g}>{c.gradeLabel(g)}</option>)}
          </select>
        </div>
        <fieldset className="fld" style={{ border: 0, margin: 0, padding: 0 }}>
          <legend>{c.gender}</legend>
          <div className="opts">
            {c.genders.map((g) => (
              <button key={g} type="button" className="opt" aria-pressed={gender === g} onClick={() => setGender(gender === g ? '' : g)}>{g}</button>
            ))}
          </div>
        </fieldset>
        <label className="check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            <b>{c.consent}</b>
            <span className="small" style={{ display: 'block', textAlign: 'left', marginTop: 4 }}>{c.consentNote}</span>
          </span>
        </label>
      </div>
      <div className="screen__foot screen__foot--line" style={{ gap: 8 }}>
        <Button onClick={() => onDone({ consent, info: { school, grade, gender } })}>{settings ? c.save : c.next}</Button>
        {!settings && <button type="button" className="textbtn" onClick={onSkip}>{c.skip}</button>}
      </div>
    </div>
  )
}
