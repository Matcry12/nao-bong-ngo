export default function Button({ variant = '', onClick, children }) {
  return (
    <button type="button" className={`btn ${variant ? 'btn--' + variant : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}
