import { Fragment } from 'react'
import { parseRich } from '../richText.js'

function Inline({ tokens }) {
  return tokens.map((k, i) => {
    if (k.t === 'strong') return <strong key={i}><Inline tokens={k.c} /></strong>
    if (k.t === 'em') return <em key={i}><Inline tokens={k.c} /></em>
    return <Fragment key={i}>{k.v}</Fragment>
  })
}

export default function RichText({ text }) {
  return parseRich(text).map((b, i) => {
    if (b.type === 'h') return <p key={i}><strong><Inline tokens={b.c} /></strong></p>
    if (b.type === 'ul' || b.type === 'ol') {
      const L = b.type
      return <L key={i}>{b.items.map((it, j) => <li key={j}><Inline tokens={it} /></li>)}</L>
    }
    return (
      <p key={i}>
        {b.lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}<Inline tokens={l} /></Fragment>)}
      </p>
    )
  })
}
