// Tiny safe markdown subset -> token tree. No HTML is ever produced here.
// Block: { type: 'p'|'h'|'ul'|'ol', ... }  Inline: { t: 'text'|'strong'|'em', ... }

const BULLET = /^\s*[-*•]\s+(.*)$/
const ORDERED = /^\s*\d+[.)]\s+(.*)$/
const HEADING = /^\s*#{1,6}\s+(.*)$/
const INLINE = /\*\*(.+?)\*\*|__(.+?)__|\*(?!\s)(.+?)(?<!\s)\*|(?<![\w])_(?!\s)(.+?)(?<!\s)_(?![\w])/

export function parseInline(src) {
  const text = src.replace(/`/g, '')
  const out = []
  let rest = text
  while (rest) {
    const m = INLINE.exec(rest)
    if (!m) { out.push({ t: 'text', v: rest }); break }
    if (m.index > 0) out.push({ t: 'text', v: rest.slice(0, m.index) })
    const strong = m[1] ?? m[2]
    if (strong !== undefined) out.push({ t: 'strong', c: parseInline(strong) })
    else out.push({ t: 'em', c: parseInline(m[3] ?? m[4]) })
    rest = rest.slice(m.index + m[0].length)
  }
  return out
}

export function parseRich(input) {
  const blocks = []
  let para = null
  const flush = () => { para = null }
  const text = String(input ?? '').replace(/\r\n?/g, '\n')
  for (const line of text.split('\n')) {
    if (!line.trim()) { flush(); continue }
    let m
    if ((m = HEADING.exec(line))) {
      flush()
      blocks.push({ type: 'h', c: parseInline(m[1].trim()) })
    } else if ((m = BULLET.exec(line)) || (m = ORDERED.exec(line))) {
      flush()
      const type = BULLET.test(line) ? 'ul' : 'ol'
      const last = blocks[blocks.length - 1]
      const item = parseInline(m[1].trim())
      if (last && last.type === type) last.items.push(item)
      else blocks.push({ type, items: [item] })
    } else if (para) {
      para.lines.push(parseInline(line.trim()))
    } else {
      para = { type: 'p', lines: [parseInline(line.trim())] }
      blocks.push(para)
    }
  }
  return blocks
}
