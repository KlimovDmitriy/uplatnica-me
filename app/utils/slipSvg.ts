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
  /** Drawn without the left border (top, right and bottom only). */
  open?: boolean
}

/**
 * Tick boxes hang from the top border: [label right edge, box x, box width].
 * Measured from a scan of a real Prva banka slip (docs/research.md, «Бланк: размеры по источникам», ±0.5 mm).
 */
export const TICKS = {
  urgent: { label: 102.7, box: 104.2, w: 5.1 },
  prenos: { label: 131.4, box: 132.9, w: 6.3 },
  uplata: { label: 166.5, box: 168, w: 6.5 },
  isplata: { label: 202.1, box: 203.6, w: 6.25 },
} as const
export const TICK = { y: 0, h: 5.9 } as const
/** Divider between the payer and payee panels; full height. */
const DIVIDER_X = 109.3
/** Baseline of a field caption below its box. */
const CAPTION_DY = 2.9
const LABEL_SIZE = 2.6

/** Geometry of the fields in millimetres, shared by the SVG and the editable slip. */
export const SLIP_BOXES: SlipBox[] = [
  // Left fields have no left border; their left edge and width are ours (the scan is cropped there).
  { key: 'payer', caption: 'payer', x: 5, y: 16.7, w: 100.2, h: 12.3, multiline: true, open: true },
  { key: 'purpose', caption: 'purpose', x: 5, y: 40.5, w: 100.2, h: 15, multiline: true, open: true },
  { key: 'payee', caption: 'payee', x: 5, y: 63.2, w: 100.2, h: 12.4, multiline: true, open: true },
  { key: 'payerAccount', caption: 'payerAccount', x: 113.5, y: 8.9, w: 92.4, h: 7.7, mono: true, anchor: 'middle' },
  { key: 'debitModel', caption: 'model', x: 113.5, y: 21.9, w: 15.4, h: 7.7, mono: true, anchor: 'middle' },
  { key: 'debitReference', caption: 'debitReference', x: 134.6, y: 21.9, w: 71.4, h: 7.7, mono: true, anchor: 'middle' },
  { key: 'amount', caption: 'amount', x: 122.9, y: 36.3, w: 59.4, h: 7.4, mono: true, anchor: 'middle' },
  { key: 'paymentCode', caption: 'paymentCode', x: 188.4, y: 36.3, w: 17.4, h: 7.4, mono: true, anchor: 'middle' },
  { key: 'account', caption: 'account', x: 113.5, y: 49.5, w: 92.4, h: 7.5, mono: true, anchor: 'middle' },
  { key: 'model', caption: 'model', x: 113.5, y: 63.9, w: 16.2, h: 8.1, mono: true, anchor: 'middle' },
  { key: 'reference', caption: 'reference', x: 134.8, y: 63.9, w: 71.2, h: 8.1, mono: true, anchor: 'middle' },
  { key: 'place', caption: 'place', x: 150, y: 90.2, w: 56, h: 5, anchor: 'middle', line: true },
]

/** Signature lines: [x1, x2, y, caption]. Filled by hand or by the bank. */
const SIGNATURE_LINES: [number, number, number, SlipLabel][] = [
  [8, 88.6, 88.1, 'signature'],
  [113.8, 155, 85.7, 'payeeSignature'],
  [163, 206, 85.7, 'executionDate'],
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
  /** Left, top, right, bottom without the left side: for the three left fields. */
  const openRect = (x: number, y: number, w: number, h: number) =>
    out.push(`<path d="M${x} ${y}H${x + w}V${y + h}H${x}" fill="none" stroke="${ink}" stroke-width=".3"/>`)
  const cross = (x: number, w: number) =>
    out.push(`<path d="M${x + .8} ${TICK.y + .8}L${x + w - .8} ${TICK.y + TICK.h - .8}M${x + w - .8} ${TICK.y + .8}L${x + .8} ${TICK.y + TICK.h - .8}" stroke="${ink}" stroke-width=".35"/>`)

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

  // Outer frame; the tick boxes hang from its top edge.
  rect(.15, .15, 209.7, 98.7)
  out.push(`<line x1="${DIVIDER_X}" y1="0" x2="${DIVIDER_X}" y2="99" stroke="${ink}" stroke-width=".3"/>`)

  // Header row: title, Hitnost and the purpose ticks.
  text(24, 14.4, LABELS.title, { size: 3.6, bold: true })
  for (const [key, pos] of Object.entries(TICKS) as [keyof typeof TICKS, { label: number, box: number, w: number }][]) {
    text(pos.label, 3, LABELS[key], { size: LABEL_SIZE, anchor: 'end' })
    rect(pos.box, TICK.y, pos.w, TICK.h)
  }
  if (withValues) {
    cross(TICKS[form.kind].box, TICKS[form.kind].w)
    if (form.kind === 'prenos' && form.urgent) cross(TICKS.urgent.box, TICKS.urgent.w)
  }

  text(115, 41.3, 'EUR', { size: 3.2 })

  for (const b of SLIP_BOXES) {
    if (b.line) hline(b.x, b.x + b.w, b.y + b.h)
    else if (b.open) openRect(b.x, b.y, b.w, b.h)
    else rect(b.x, b.y, b.w, b.h)
    text(b.x + b.w / 2, b.y + b.h + CAPTION_DY, `(${LABELS[b.caption]})`, { anchor: 'middle', size: LABEL_SIZE })
    if (withValues) value(b, boxText(form, b.key))
  }

  for (const [x1, x2, y, key] of SIGNATURE_LINES) {
    hline(x1, x2, y)
    text((x1 + x2) / 2, y + CAPTION_DY, `(${LABELS[key]})`, { anchor: 'middle', size: LABEL_SIZE })
  }

  // Clip ids must be unique when several slips share a page; derive them from the content
  // so server and client render identical markup.
  const body = out.join('')
  let hash = 5381
  for (let i = 0; i < body.length; i++) hash = ((hash * 33) ^ body.charCodeAt(i)) >>> 0
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 99" width="210mm" height="99mm" font-family="Arial, Helvetica, sans-serif">`
    + `<rect width="210" height="99" fill="#fff"/>${body.replaceAll('@ID@', `s${hash.toString(36)}c`)}</svg>`
}
