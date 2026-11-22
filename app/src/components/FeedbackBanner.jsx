import Button from './Button.jsx'
import { content } from '../content.js'

export default function FeedbackBanner({ right, message, note, onNext }) {
  return (
    <div className={`banner ${right ? 'banner--right' : 'banner--wrong'}`} role="status">
      <div style={note ? { display: 'flex', flexDirection: 'column', gap: 4 } : undefined}>
        <div className="banner__row">
          <div className="banner__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={right ? 'M5 12.5l4.5 4.5L19 7.5' : 'M6 6l12 12M18 6L6 18'} />
            </svg>
          </div>
          {message}
        </div>
        {note && <div className="banner__note">{note}</div>}
      </div>
      <Button variant={right ? 'correct' : 'danger'} onClick={onNext}>{content.common.next}</Button>
    </div>
  )
}
