import { describe, expect, it } from 'vitest'
import {
  accountControl, formatAccount, formatAccountFull, isAccountChecksumValid, isIbanValid, isJmbValid, isPibValid,
  normalizeAccount, toIban, validateNalog, type NalogInput,
} from '../shared/utils/nalog'

const input = (over: Partial<NalogInput> = {}): NalogInput => ({
  kind: 'uplata',
  payer: 'Marko Marković\nBeogradska 15',
  purpose: 'Porez na ostala lična primanja',
  payee: 'Jedinstveni račun poreza na dohodak',
  payerAccount: '',
  debitModel: '',
  debitReference: 'I/2015 1',
  amount: 150,
  paymentCode: '',
  account: '820-30000-74',
  model: '18',
  reference: '0205973210263-302',
  ...over,
})

describe('accounts', () => {
  it('parses paper, 18-digit and IBAN notation', () => {
    expect(normalizeAccount('820-30000-74')).toBe('820000000003000074')
    expect(normalizeAccount('820000000003000074')).toBe('820000000003000074')
    expect(normalizeAccount('ME25 8200 0000 0003 0000 74')).toBe('820000000003000074')
    expect(normalizeAccount('820-30000')).toBeNull()
    expect(normalizeAccount('ME26 8200 0000 0003 0000 74')).toBeNull()
  })

  it('formats with and without leading zeros', () => {
    expect(formatAccount('820000000003000074')).toBe('820-30000-74')
    expect(formatAccountFull('820000000003000074')).toBe('820-0000000030000-74')
  })

  it('checks mod 97 on accounts from the official samples', () => {
    for (const a of ['820-30000-74', '805-955-02', '832-20000-46', '840-80-82', '510-30280140-23']) {
      expect(isAccountChecksumValid(normalizeAccount(a)!), a).toBe(true)
    }
    expect(isAccountChecksumValid(normalizeAccount('820-30000-75')!)).toBe(false)
    expect(accountControl('8200000000030000')).toBe('74')
  })

  it('IBAN check digits are 25 for every valid account', () => {
    const iban = toIban('820000000003000074')
    expect(iban).toBe('ME25820000000003000074')
    expect(isIbanValid(iban)).toBe(true)
  })
})

describe('PIB and JMB', () => {
  it('accepts the identifiers from the official samples', () => {
    expect(isJmbValid('0205973210263')).toBe(true)
    expect(isPibValid('02088762')).toBe(true)
    expect(isPibValid('02016281')).toBe(true)
  })

  it('rejects a wrong check digit', () => {
    expect(isJmbValid('0205973210264')).toBe(false)
    expect(isPibValid('02088763')).toBe(false)
  })
})

describe('JMB control digit edge cases', () => {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  it('rejects every last digit when the computed control is 10', () => {
    // 7 * 8 = 56 = 5 * 11 + 1, so control = 11 - 1 = 10.
    for (const d of digits) expect(isJmbValid(`000000800000${d}`)).toBe(false)
  })

  it('accepts only 0 when the computed control is 11', () => {
    // Sum 0, so control = 11 - 0 = 11.
    for (const d of digits) expect(isJmbValid(`000000000000${d}`)).toBe(d === 0)
  })
})

describe('validateNalog', () => {
  it('passes the official sample', () => {
    expect(validateNalog(input())).toEqual([])
  })

  it('requires names and purpose, and limits them to 3 × 35', () => {
    expect(validateNalog(input({ payer: ' ' }))).toContain('payer.required')
    expect(validateNalog(input({ payee: 'x'.repeat(36) }))).toContain('payee.tooLong')
    expect(validateNalog(input({ purpose: 'a\nb\nc\nd' }))).toContain('purpose.tooLong')
  })

  it('checks model 18 references', () => {
    expect(validateNalog(input({ reference: '0205973210263302' }))).toContain('reference.format18')
    expect(validateNalog(input({ reference: '0205973210264-302' }))).toContain('reference.id')
    expect(validateNalog(input({ reference: '02088762-728' }))).toEqual([])
    // Police fines: JMB and revenue code 003 instead of a municipality.
    expect(validateNalog(input({ reference: '0205973210263-003' }))).toEqual([])
  })

  it('leaves other models free-form', () => {
    expect(validateNalog(input({ model: '05', reference: '0123ME03502540000192' }))).toEqual([])
    expect(validateNalog(input({ model: '05', reference: '0123ME035025400001920' }))).toContain('reference.tooLong')
  })

  it('checks the payer account only on prenos and not the "xxx" placeholder', () => {
    expect(validateNalog(input({ kind: 'prenos', payerAccount: 'xxx' }))).toEqual([])
    expect(validateNalog(input({ kind: 'prenos', payerAccount: '510-12345-00' }))).toContain('payerAccount.checksum')
    expect(validateNalog(input({ kind: 'uplata', payerAccount: '510-12345-00' }))).toEqual([])
  })

  it('validates amount and payment code', () => {
    expect(validateNalog(input({ amount: Number.NaN }))).toContain('amount.invalid')
    expect(validateNalog(input({ paymentCode: '30' }))).toContain('paymentCode.invalid')
    expect(validateNalog(input({ paymentCode: '300' }))).toEqual([])
  })
})
