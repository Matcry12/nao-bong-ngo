export default function ChoiceCard({ selected, onClick, children }) {
  return (
    <button type="button" className={`choice ${selected ? 'choice--on' : ''}`} aria-pressed={selected} onClick={onClick}>
      {children}
    </button>
  )
}
