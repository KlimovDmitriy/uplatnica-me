import type { SlipForm } from '~/composables/useSlip'

/**
 * Slip ⇄ URL fragment. The data lives after "#", so it never reaches the server,
 * access logs or analytics. Format: "#n=" + base64url(JSON array), versioned by position 0.
 */
const FIELDS = [
  'kind', 'payer', 'purpose', 'payee', 'amount', 'account', 'model', 'reference',
  'debitModel', 'debitReference', 'paymentCode', 'payerAccount', 'place', 'urgent',
] as const satisfies readonly (keyof SlipForm)[]

const VERSION = 1

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(data: string): string {
  const bin = atob(data.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)))
}

export function encodeSlip(form: SlipForm): string {
  const values = FIELDS.map(f => (f === 'urgent' ? (form.urgent ? 1 : 0) : form[f]))
  // Trim trailing empties to keep links short.
  while (values.length && (values.at(-1) === '' || values.at(-1) === 0)) values.pop()
  return toBase64Url(JSON.stringify([VERSION, ...values]))
}

export function decodeSlip(data: string): Partial<SlipForm> | null {
  try {
    const [version, ...values] = JSON.parse(fromBase64Url(data)) as unknown[]
    if (version !== VERSION) return null
    const out: Record<string, unknown> = {}
    FIELDS.forEach((f, i) => {
      const v = values[i]
      if (v === undefined) return
      out[f] = f === 'urgent' ? v === 1 : String(v)
    })
    if (out.kind !== 'uplata' && out.kind !== 'prenos') delete out.kind
    return out as Partial<SlipForm>
  }
  catch {
    return null
  }
}

export const SHARE_PARAM = 'n'
