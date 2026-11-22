import { content } from '../content.js'

export default function ProgressBar({ value, onClose }) {
  return (
    <div className="topbar">
      <button type="button" className="topbar__close" aria-label={content.common.close} onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className="progress" role="progressbar" aria-label={content.common.progress} aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
        <div className="progress__fill" style={{ width: value + '%' }} />
      </div>
    </div>
  )
}
