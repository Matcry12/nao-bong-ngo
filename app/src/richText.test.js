import { describe, it, expect } from 'vitest'
import { parseRich, parseInline } from './richText.js'

const T = (v) => ({ t: 'text', v })

describe('parseInline', () => {
  it('bold with ** and __', () => {
    expect(parseInline('a **b** c')).toEqual([T('a '), { t: 'strong', c: [T('b')] }, T(' c')])
    expect(parseInline('__b__')).toEqual([{ t: 'strong', c: [T('b')] }])
  })
  it('italic with * and _', () => {
    expect(parseInline('*x*')).toEqual([{ t: 'em', c: [T('x')] }])
    expect(parseInline('_x_')).toEqual([{ t: 'em', c: [T('x')] }])
  })
  it('leaves snake_case and lone markers alone', () => {
    expect(parseInline('a_b_c')).toEqual([T('a_b_c')])
    expect(parseInline('2 * 3')).toEqual([T('2 * 3')])
    expect(parseInline('**mở')).toEqual([T('**mở')])
  })
  it('strips backticks', () => {
    expect(parseInline('dùng `x` nhé')).toEqual([T('dùng x nhé')])
  })
  it('keeps html as text', () => {
    expect(parseInline('<b>hi</b>')).toEqual([T('<b>hi</b>')])
  })
})

describe('parseRich', () => {
  it('splits paragraphs and joins single newlines', () => {
    const r = parseRich('một\nhai\n\nba')
    expect(r).toHaveLength(2)
    expect(r[0].type).toBe('p')
    expect(r[0].lines).toHaveLength(2)
  })
  it('bullet lists with -, *, •', () => {
    const r = parseRich('- a\n* b\n• c')
    expect(r).toEqual([{ type: 'ul', items: [[T('a')], [T('b')], [T('c')]] }])
  })
  it('ordered lists, merged across blank lines', () => {
    const r = parseRich('1. a\n\n2. b')
    expect(r).toEqual([{ type: 'ol', items: [[T('a')], [T('b')]] }])
  })
  it('paragraph then list', () => {
    const r = parseRich('Thử nhé:\n- a\n- b')
    expect(r.map((b) => b.type)).toEqual(['p', 'ul'])
  })
  it('headings become a heading block without # marks', () => {
    expect(parseRich('## Tiêu đề')).toEqual([{ type: 'h', c: [T('Tiêu đề')] }])
  })
  it('bold at line start is not a bullet', () => {
    expect(parseRich('**đậm** rồi')[0].type).toBe('p')
  })
  it('handles empty / non-string input', () => {
    expect(parseRich('')).toEqual([])
    expect(parseRich(null)).toEqual([])
  })
})
