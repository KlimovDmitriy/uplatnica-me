import type { SlipForm } from '~/composables/useSlip'

/**
 * "Nalog platioca" as an SVG string in millimetres (210 × 99, the official size, čl. 4).
 * Field order and relative positions follow Prilog 1 of the CBCG decision (čl. 9 makes them
 * mandatory, exact millimetres are not prescribed; see docs/research.md §2.4).
 * One drawing serves the on-screen editor, window.print() and the PDF export.
 */

export const LABELS = {
  title: 'NALOG PLATIOCA',
  urgent: 'Hitnost',
  prenos: 'Prenos',
  uplata: 'Uplata',
  isplata: 'Isplata',
  payer: 'Naziv platioca',
  purpose: 'Svrha plaćanja',
  payee: 'Naziv primaoca plaćanja',
  payerAccount: 'Transakcioni račun platioca',
  model: 'Model',
  debitReference: 'Poziv na broj zaduženja',
  amount: 'Iznos',
  paymentCode: 'Šifra plaćanja',
  account: 'Transakcioni račun primaoca plaćanja',
  reference: 'Poziv na broj odobrenja',
  signature: 'Pečat i potpis platioca kao inicijatora',
  payeeSignature: 'Potpis primaoca plaćanja',
  executionDate: 'Datum izvršavanja',
  place: 'Mjesto i datum podnošenja',
}

export type SlipLabel = keyof typeof LABELS

export interface SlipBox {
  key: Exclude<keyof SlipForm, 'kind' | 'urgent'>
  caption: SlipLabel
  x: number
  y: number
  w: number
  h: number
  /** Up to 3 lines (names, purpose). */
  multiline?: boolean
  mono?: boolean
  anchor?: 'start' | 'middle' | 'end'
  /** Drawn as a signature-style line instead of a box. */
  line?: boolean
}

/** Tick boxes of the header row: [label, label x, box x]. */
export const TICKS = {
  urgent: { label: 85, box: 97 },
  prenos: { label: 122, box: 135 },
  uplata: { label: 154, box: 167 },
  isplata: { label: 185, box: 198 },
} as const
export const TICK = { y: 3.5, size: 7 } as const

/** Geometry of the fields in millimetres, shared by the SVG and the editable slip. */
export const SLIP_BOXES: SlipBox[] = [
  { key: 'payer', caption: 'payer', x: 5, y: 14, w: 98, h: 13, multiline: true },
  { key: 'purpose', caption: 'purpose', x: 5, y: 35, w: 98, h: 13, multiline: true },
  { key: 'payee', caption: 'payee', x: 5, y: 56, w: 98, h: 13, multiline: true },
  { key: 'payerAccount', caption: 'payerAccount', x: 112, y: 14, w: 94, h: 7, mono: true, anchor: 'middle' },
  { key: 'debitModel', caption: 'model', x: 112, y: 27, w: 12, h: 7, mono: true, anchor: 'middle' },
  { key: 'debitReference', caption: 'debitReference', x: 127, y: 27, w: 79, h: 7, mono: true, anchor: 'middle' },
  { key: 'amount', caption: 'amount', x: 123, y: 40, w: 57, h: 7, mono: true, anchor: 'middle' },
  { key: 'paymentCode', caption: 'paymentCode', x: 183, y: 40, w: 23, h: 7, mono: true, anchor: 'middle' },
  { key: 'account', caption: 'account', x: 112, y: 53, w: 94, h: 7, mono: true, anchor: 'middle' },
  { key: 'model', caption: 'model', x: 112, y: 66, w: 12, h: 7, mono: true, anchor: 'middle' },
  { key: 'reference', caption: 'reference', x: 127, y: 66, w: 79, h: 7, mono: true, anchor: 'middle' },
  { key: 'place', caption: 'place', x: 150, y: 86, w: 56, h: 6, anchor: 'middle', line: true },
]

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function prettyAccount(raw: string): string {
  const acc = normalizeAccount(raw)
  return acc ? formatAccount(acc) : raw
}

/** Text drawn in a field: accounts in paper notation, amount between double dashes (Prilog 2, row 4). */
function boxText(form: SlipForm, key: SlipBox['key']): string {
  if (key === 'account' || key === 'payerAccount') return prettyAccount(form[key])
  if (key === 'amount') {
    const amount = formatAmount(parseAmount(form.amount))
    return amount && `=${amount}=`
  }
  return String(form[key] ?? '')
}

/**
 * @param withValues false draws only the blank form: the editable slip puts real inputs on top of it.
 */
export function renderSlipSvg(form: SlipForm, withValues = true): string {
  const ink = '#000'
  const out: string[] = []
  let clipId = 0

  const text = (x: number, y: number, s: string, { size = 2.2, anchor = 'start', bold = false } = {}) =>
    out.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${ink}" text-anchor="${anchor}"${bold ? ' font-weight="700"' : ''}>${esc(s)}</text>`)
  const rect = (x: number, y: number, w: number, h: number) =>
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${ink}" stroke-width=".3"/>`)
  const hline = (x1: number, x2: number, y: number) =>
    out.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${ink}" stroke-width=".25"/>`)
  const cross = (x: number) =>
    out.push(`<path d="M${x + 1.5} ${TICK.y + 1.5}l4 4M${x + 5.5} ${TICK.y + 1.5}l-4 4" stroke="${ink}" stroke-width=".45"/>`)

  const value = (b: SlipBox, s: string) => {
    const lines = s.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 3)
    if (!lines.length) return
    const id = `@ID@${clipId++}`
    const family = b.mono ? 'Courier New, monospace' : 'Arial, Helvetica, sans-serif'
    const anchor = b.anchor ?? 'start'
    const tx = anchor === 'middle' ? b.x + b.w / 2 : anchor === 'end' ? b.x + b.w - 1.2 : b.x + 1.2
    out.push(`<clipPath id="${id}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/></clipPath>`)
    out.push(`<g clip-path="url(#${id})" font-family="${family}" font-size="3" fill="${ink}"${b.mono ? ' font-weight="700"' : ''}>`)
    const top = b.multiline ? b.y + 3.9 : b.y + b.h / 2 + 1.05
    lines.forEach((line, i) => out.push(`<text x="${tx}" y="${top + i * 3.8}" text-anchor="${anchor}">${esc(line)}</text>`))
    out.push('</g>')
  }

  // Header row: title, Hitnost and the purpose ticks.
  text(24, 9, LABELS.title, { size: 3.4, bold: true })
  for (const [key, pos] of Object.entries(TICKS) as [keyof typeof TICKS, { label: number, box: number }][]) {
    text(pos.label, 8.4, LABELS[key], { size: 2.6 })
    rect(pos.box, TICK.y, TICK.size, TICK.size)
  }
  if (withValues) {
    cross(TICKS[form.kind].box)
    if (form.kind === 'prenos' && form.urgent) cross(TICKS.urgent.box)
  }

  out.push(`<line x1="108.5" y1="12" x2="108.5" y2="92" stroke="${ink}" stroke-width=".25"/>`)
  text(112, 45, 'EUR', { size: 3.2, bold: true })

  for (const b of SLIP_BOXES) {
    if (b.line) hline(b.x, b.x + b.w, b.y + b.h)
    else rect(b.x, b.y, b.w, b.h)
    text(b.x + b.w / 2, b.y + b.h + 3, `(${LABELS[b.caption]})`, { anchor: 'middle' })
    if (withValues) value(b, boxText(form, b.key))
  }

  // Signature lines: filled by hand or by the bank.
  const lines: [number, number, number, SlipLabel][] = [
    [8, 74, 84, 'signature'],
    [112, 146, 78, 'payeeSignature'],
    [160, 206, 78, 'executionDate'],
  ]
  for (const [x1, x2, y, key] of lines) {
    hline(x1, x2, y)
    text((x1 + x2) / 2, y + 3, `(${LABELS[key]})`, { anchor: 'middle' })
  }

  // Clip ids must be unique when several slips share a page; derive them from the content
  // so server and client render identical markup.
  const body = out.join('')
  let hash = 5381
  for (let i = 0; i < body.length; i++) hash = ((hash * 33) ^ body.charCodeAt(i)) >>> 0
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 99" width="210mm" height="99mm" font-family="Arial, Helvetica, sans-serif">`
    + `<rect width="210" height="99" fill="#fff"/>${body.replaceAll('@ID@', `s${hash.toString(36)}c`)}</svg>`
}
