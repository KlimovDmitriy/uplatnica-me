/**
 * Montenegrin payment order (nalog za plaćanje) rules.
 *
 * - Form fields and formats: CBCG "Odluka o osnovnim elementima naloga za plaćanje",
 *   Sl. list CG 48/14, 50/14, 104/26 (Prilog 2).
 * - Account structure, mod 97 and IBAN: CBCG "Odluka o strukturi … transakcionih računa", 80/20.
 * - Models 18 and 05 for public revenues: "Naredba o načinu uplate javnih prihoda", 121/23, 81/24.
 * Sources and details: docs/research.md.
 */

export const LIMITS = {
  /** Names and purpose: 3 lines × 35 characters. */
  lines: 3,
  lineLength: 35,
  /** Poziv na broj: 20 characters. */
  reference: 20,
} as const

export type NalogKind = 'prenos' | 'uplata'

export interface NalogInput {
  kind: NalogKind
  payer: string
  purpose: string
  payee: string
  /** Payer account, prenos only; optional on the paper form. */
  payerAccount: string
  debitModel: string
  debitReference: string
  /** Amount in EUR. */
  amount: number
  /** 3 digits, optional ("po potrebi"); 300 for fines. */
  paymentCode: string
  account: string
  model: string
  reference: string
}

export type NalogError =
  | 'payer.required' | 'payer.tooLong'
  | 'purpose.required' | 'purpose.tooLong'
  | 'payee.required' | 'payee.tooLong'
  | 'payerAccount.invalid' | 'payerAccount.checksum'
  | 'debitModel.invalid'
  | 'debitReference.tooLong' | 'debitReference.invalid'
  | 'amount.invalid'
  | 'paymentCode.invalid'
  | 'account.required' | 'account.invalid' | 'account.checksum'
  | 'model.invalid'
  | 'reference.tooLong' | 'reference.invalid' | 'reference.format18' | 'reference.id'

const mod97 = (digits: string) => Number(BigInt(digits) % BigInt(97))

/**
 * 18-digit account from any common notation: "510-12345-67", 18 digits, or IBAN "ME25 5100 …".
 * Returns null when it can't be parsed.
 */
export function normalizeAccount(input: string): string | null {
  const raw = input.replace(/\s/g, '').toUpperCase()
  if (/^\d{18}$/.test(raw)) return raw
  if (/^ME\d{20}$/.test(raw)) return isIbanValid(raw) ? raw.slice(4) : null
  const m = raw.match(/^(\d{3})-(\d{1,13})-(\d{2})$/)
  return m ? m[1]! + m[2]!.padStart(13, '0') + m[3]! : null
}

/** 510000000001234567 → "510-12345-67": the paper notation, leading zeros of the middle part dropped. */
export function formatAccount(account18: string): string {
  const middle = account18.slice(3, 16).replace(/^0+/, '') || '0'
  return `${account18.slice(0, 3)}-${middle}-${account18.slice(16)}`
}

/** Same with all 13 middle digits: "510-0000000012345-67". */
export function formatAccountFull(account18: string): string {
  return `${account18.slice(0, 3)}-${account18.slice(3, 16)}-${account18.slice(16)}`
}

export const isAccountChecksumValid = (account18: string) => mod97(account18) === 1

/** Control digits for the first 16 digits of an account. */
export function accountControl(first16: string): string {
  return String(98 - mod97(`${first16}00`)).padStart(2, '0')
}

function ibanDigits(iban: string): string {
  const moved = iban.slice(4) + iban.slice(0, 4)
  return moved.replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 55))
}

export const isIbanValid = (iban: string) => /^ME\d{20}$/.test(iban) && mod97(ibanDigits(iban)) === 1

/** IBAN for an 18-digit account. For a valid account the check digits are always 25. */
export function toIban(account18: string): string {
  const check = String(98 - mod97(ibanDigits(`ME00${account18}`))).padStart(2, '0')
  return `ME${check}${account18}`
}

/** "ME25510000000001234567" → "ME25 5100 0000 0001 2345 67". */
export const formatIban = (iban: string) => iban.replace(/(.{4})/g, '$1 ').trim()

/** JMB (13 digits): mod 11 with weights 7…2 over both halves. */
export function isJmbValid(jmb: string): boolean {
  if (!/^\d{13}$/.test(jmb)) return false
  const d = [...jmb].map(Number)
  const sum = [7, 6, 5, 4, 3, 2].reduce((s, w, i) => s + w * (d[i]! + d[i + 6]!), 0)
  const control = 11 - (sum % 11)
  return (control > 9 ? 0 : control) === d[12]
}

/** PIB (8 digits): mod 11 with weights 8…2. */
export function isPibValid(pib: string): boolean {
  if (!/^\d{8}$/.test(pib)) return false
  const d = [...pib].map(Number)
  const sum = [8, 7, 6, 5, 4, 3, 2].reduce((s, w, i) => s + w * d[i]!, 0)
  const control = 11 - (sum % 11)
  return (control > 9 ? 0 : control) === d[7]
}

/** Model 18: PIB (8) or JMB (13), a dash and a 3-digit code (municipality, or revenue type for police fines). */
export const MODEL_18 = /^(\d{8}|\d{13})-(\d{3})$/

export function buildModel18(id: string, code: string): string {
  return `${id.replace(/\D/g, '')}-${code}`
}

const REFERENCE_CHARS = /^[\dA-Za-z/\-. ]+$/

function textError<F extends 'payer' | 'purpose' | 'payee'>(field: F, value: string): NalogError | undefined {
  const lines = value.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (!lines.length) return `${field}.required` as NalogError
  if (lines.length > LIMITS.lines || lines.some(l => l.length > LIMITS.lineLength)) return `${field}.tooLong` as NalogError
}

function accountError(value: string): 'invalid' | 'checksum' | undefined {
  const acc = normalizeAccount(value)
  if (!acc) return 'invalid'
  if (!isAccountChecksumValid(acc)) return 'checksum'
}

export function validateNalog(input: NalogInput): NalogError[] {
  const errors: NalogError[] = []
  for (const f of ['payer', 'purpose', 'payee'] as const) {
    const e = textError(f, input[f])
    if (e) errors.push(e)
  }

  // "xxx" is how the official samples leave the payer account for the bank to fill in.
  if (input.kind === 'prenos' && /\d/.test(input.payerAccount)) {
    const e = accountError(input.payerAccount)
    if (e) errors.push(`payerAccount.${e}`)
  }

  if (!input.account.trim()) errors.push('account.required')
  else {
    const e = accountError(input.account)
    if (e) errors.push(`account.${e}`)
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount >= 1e12) errors.push('amount.invalid')
  if (input.paymentCode && !/^\d{3}$/.test(input.paymentCode)) errors.push('paymentCode.invalid')

  if (input.debitModel && !/^\d{2}$/.test(input.debitModel)) errors.push('debitModel.invalid')
  const debit = input.debitReference.trim()
  if (debit.length > LIMITS.reference) errors.push('debitReference.tooLong')
  else if (debit && !REFERENCE_CHARS.test(debit)) errors.push('debitReference.invalid')

  if (input.model && !/^\d{2}$/.test(input.model)) errors.push('model.invalid')
  const ref = input.reference.trim()
  if (ref.length > LIMITS.reference) errors.push('reference.tooLong')
  else if (ref && !REFERENCE_CHARS.test(ref)) errors.push('reference.invalid')
  else if (ref && input.model === '18') {
    const m = ref.match(MODEL_18)
    if (!m) errors.push('reference.format18')
    else if (!(m[1]!.length === 8 ? isPibValid(m[1]!) : isJmbValid(m[1]!))) errors.push('reference.id')
  }

  return errors
}
