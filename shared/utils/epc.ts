/**
 * SEPA credit transfer helpers: IBAN / BIC checks and the EPC QR payload (EPC069-12, "BCD").
 * Banks and wallets in the EU scan this code to prefill a euro transfer.
 */
const MOD = BigInt(97)

/** "rs35 1600 0000 0000 0002 70" → "RS35160000000000000270" */
export function normalizeIban(input: string): string {
  return input.replace(/\s/g, '').toUpperCase()
}

/** RS35160000000000000270 → "RS35 1600 0000 0000 0002 70" (groups of 4). */
export function groupIban(iban: string): string {
  return normalizeIban(iban).replace(/(.{4})(?=.)/g, '$1 ')
}

/** ISO 13616: move the first four characters to the end, letters become 10..35, remainder mod 97 is 1. */
export function isIbanChecksumValid(input: string): boolean {
  const iban = normalizeIban(input)
  if (!/^[A-Z]{2}\d{2}[A-Z\d]{11,30}$/.test(iban)) return false
  const digits = (iban.slice(4) + iban.slice(0, 4))
    .replace(/[A-Z]/g, ch => String(ch.charCodeAt(0) - 55))
  return BigInt(digits) % MOD === BigInt(1)
}

/** 8 or 11 characters: bank (4 letters), country (2 letters), location (2), optional branch (3). */
export function isBic(input: string): boolean {
  return /^[A-Z]{4}[A-Z]{2}[A-Z\d]{2}(?:[A-Z\d]{3})?$/.test(input.trim().toUpperCase())
}

export const EPC_LIMITS = { name: 70, remittance: 140 } as const

export interface EpcInput {
  bic: string
  name: string
  iban: string
  /** EUR; left out (or below 0.01) means the payer types the amount. */
  amount?: number
  /** Unstructured remittance information. */
  text?: string
}

/** One line of the payload: no line breaks inside a field, at most `max` characters. */
function field(value: string, max: number): string {
  return Array.from(value.replace(/\s+/g, ' ').trim()).slice(0, max).join('')
}

/**
 * Lines: service tag, version, charset (1 = UTF-8), identification, BIC, name, IBAN,
 * "EUR" + amount, purpose code (empty), structured reference (empty), remittance text.
 */
export function buildEpcQr(input: EpcInput): string {
  const hasAmount = input.amount !== undefined && Number.isFinite(input.amount) && input.amount >= 0.01
  return [
    'BCD',
    '002',
    '1',
    'SCT',
    input.bic.replace(/\s/g, '').toUpperCase(),
    field(input.name, EPC_LIMITS.name),
    normalizeIban(input.iban),
    hasAmount ? `EUR${input.amount!.toFixed(2)}` : '',
    '',
    '',
    field(input.text ?? '', EPC_LIMITS.remittance),
  ].join('\n')
}
