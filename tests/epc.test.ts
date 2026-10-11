import { describe, expect, it } from 'vitest'
import { buildEpcQr, groupIban, isBic, isIbanChecksumValid, normalizeIban } from '../shared/utils/epc'

const base = { bic: 'TESTRSBG', name: 'Ime Prezime', iban: 'RS35 1600 0000 0000 0002 70' }

describe('iban', () => {
  it('validates the check digits', () => {
    expect(isIbanChecksumValid('RS35160000000000000270')).toBe(true)
    expect(isIbanChecksumValid('rs35 1600 0000 0000 0002 70')).toBe(true)
    expect(isIbanChecksumValid('GB82 WEST 1234 5698 7654 32')).toBe(true)
    expect(isIbanChecksumValid('RS36160000000000000251')).toBe(false)
    expect(isIbanChecksumValid('RS35')).toBe(false)
  })

  it('formats in groups of 4', () => {
    expect(groupIban('RS35160000000000000270')).toBe('RS35 1600 0000 0000 0002 70')
    expect(groupIban(' rs35 1600 0000 0000 0002 70 ')).toBe('RS35 1600 0000 0000 0002 70')
    expect(normalizeIban('rs35 1600')).toBe('RS351600')
  })

  it('checks the BIC shape', () => {
    expect(isBic('TESTRSBG')).toBe(true)
    expect(isBic('testrsbgxxx')).toBe(true)
    expect(isBic('TESTRS')).toBe(false)
    expect(isBic('1ESTRSBG')).toBe(false)
  })
})

describe('buildEpcQr', () => {
  it('writes the fields in EPC069-12 order', () => {
    expect(buildEpcQr({ ...base, amount: 12.5, text: 'Podrška autoru' }).split('\n')).toEqual([
      'BCD', '002', '1', 'SCT', 'TESTRSBG', 'Ime Prezime', 'RS35160000000000000270', 'EUR12.50', '', '', 'Podrška autoru',
    ])
  })

  it('leaves the amount line empty without an amount', () => {
    for (const amount of [undefined, 0, -3, Number.NaN]) {
      const lines = buildEpcQr({ ...base, amount }).split('\n')
      expect(lines[7]).toBe('')
      expect(lines[7]).not.toContain('EUR')
    }
  })

  it('formats the amount with two decimals', () => {
    expect(buildEpcQr({ ...base, amount: 5 }).split('\n')[7]).toBe('EUR5.00')
    expect(buildEpcQr({ ...base, amount: 0.1 + 0.2 }).split('\n')[7]).toBe('EUR0.30')
    expect(buildEpcQr({ ...base, amount: 1234.567 }).split('\n')[7]).toBe('EUR1234.57')
  })

  it('cuts the name to 70 and the text to 140 characters', () => {
    const lines = buildEpcQr({ ...base, name: 'N'.repeat(100), text: 'š'.repeat(200) }).split('\n')
    expect(lines[5]).toHaveLength(70)
    expect(Array.from(lines[10]!)).toHaveLength(140)
  })

  it('keeps every field on its own line and uppercases the BIC', () => {
    const lines = buildEpcQr({ ...base, bic: 'testrsbg', name: 'Ime\nPrezime', text: 'a\r\nb' }).split('\n')
    expect(lines).toHaveLength(11)
    expect(lines[4]).toBe('TESTRSBG')
    expect(lines[5]).toBe('Ime Prezime')
    expect(lines[10]).toBe('a b')
  })
})
