import { describe, expect, it } from 'vitest'
import { TEMPLATES, referenceRule } from '../app/data/templates'
import { BANK_CODES } from '../app/data/bankCodes'
import { MUNICIPALITIES } from '../shared/utils/municipalities'
import { LIMITS, isAccountChecksumValid, normalizeAccount } from '../shared/utils/nalog'

const validAccount = (a: string) => {
  const acc = normalizeAccount(a)
  return !!acc && isAccountChecksumValid(acc)
}
const fits = (text: string) => text.split('\n').length <= LIMITS.lines && text.split('\n').every(l => l.length <= LIMITS.lineLength)

describe('templates', () => {
  it('every prefilled account passes mod 97', () => {
    for (const tpl of TEMPLATES) {
      for (const p of tpl.payments) {
        if (p.preset.account) expect(validAccount(p.preset.account), `${tpl.slug}/${p.id}`).toBe(true)
        else expect(p.tool?.localAccount, `${tpl.slug}/${p.id} needs an account or a municipality picker`).toBeDefined()
      }
    }
  })

  it('prefilled names and purposes fit 3 lines of 35 characters', () => {
    for (const tpl of TEMPLATES) {
      for (const p of tpl.payments) {
        for (const f of ['payee', 'purpose', 'payer'] as const) {
          if (p.preset[f]) expect(fits(p.preset[f]), `${tpl.slug}/${p.id}.${f}`).toBe(true)
        }
        if (p.tool?.payeeLine) {
          for (const m of MUNICIPALITIES) expect(fits(`${m.payee}\n${p.tool.payeeLine}`), `${tpl.slug}/${m.name}`).toBe(true)
        }
      }
    }
  })

  it('slugs are unique', () => {
    expect(new Set(TEMPLATES.map(t => t.slug)).size).toBe(TEMPLATES.length)
  })
})

describe('municipalities', () => {
  it('has all 25 municipalities with unique codes', () => {
    expect(MUNICIPALITIES).toHaveLength(25)
    expect(new Set(MUNICIPALITIES.map(m => m.code)).size).toBe(25)
    expect(MUNICIPALITIES.find(m => m.name === 'Podgorica')?.code).toBe('302')
    expect(MUNICIPALITIES.find(m => m.name === 'Kolašin')?.code).toBe('728')
  })

  it('every local revenue account passes mod 97', () => {
    for (const m of MUNICIPALITIES) {
      for (const [kind, account] of Object.entries(m.accounts)) expect(validAccount(account), `${m.name}/${kind}`).toBe(true)
    }
  })

  it('uses the accounts of Naredba 23/26 for Podgorica, Zeta and Pljevlja', () => {
    const find = (name: string) => MUNICIPALITIES.find(m => m.name === name)
    expect(find('Podgorica')?.accounts.nepokretnosti).toBe('510-30280140-23')
    expect(find('Zeta')?.accounts.boravisna).toBeDefined()
    expect(find('Pljevlja')?.accounts.nepokretnosti).toBeUndefined()
  })

  it('every account prefix is a known bank', () => {
    const codes = new Set(BANK_CODES.map(b => b.code))
    for (const m of MUNICIPALITIES) for (const a of Object.values(m.accounts)) expect(codes.has(a.slice(0, 3)), a).toBe(true)
  })
})

describe('referenceRule', () => {
  const preset = (account: string, model: string) => ({ preset: { account, model } })

  it('requires a reference for models 18 and 05 on a public-revenue account, except MUP (reference given at the counter)', () => {
    expect(referenceRule(preset('820-30000-74', '18'))).toBe('tax')
    expect(referenceRule(preset('805-955-02', '05'))).toBe('tax')
    expect(referenceRule(preset('825-42-95', '05'))).toBeNull()
    expect(referenceRule({ ...preset('825-42-95', '05'), referenceRequired: true })).toBe('mup')
    expect(referenceRule(preset('840-80-82', '18'))).toBe('institution')
    expect(referenceRule(preset('832-20000-46', '18'))).toBe('institution')
  })

  it('counts a payment with a municipality picker (its account comes later) as public revenue', () => {
    expect(referenceRule({ preset: { model: '18' }, tool: { localAccount: 'prirez' } })).toBe('institution')
  })

  it('does not require one for other accounts or models, or without a payment', () => {
    expect(referenceRule(preset('510-12345-67', '18'))).toBeNull()
    expect(referenceRule(preset('820-30000-74', '00'))).toBeNull()
    expect(referenceRule(preset('820-30000-74', ''))).toBeNull()
    expect(referenceRule(undefined)).toBeNull()
  })

  it('lets the data override the derivation both ways', () => {
    expect(referenceRule({ ...preset('820-30000-74', '18'), referenceRequired: false })).toBeNull()
    expect(referenceRule({ ...preset('510-12345-67', '00'), referenceRequired: true })).toBe('institution')
  })

  it('applies to every payment of the templates except MUP', () => {
    for (const tpl of TEMPLATES) {
      for (const p of tpl.payments) {
        const mup = p.preset.account?.startsWith('825-')
        expect(referenceRule(p) === null, `${tpl.slug}/${p.id}`).toBe(!!mup)
      }
    }
  })
})
