import { describe, expect, it } from 'vitest'
import { resolveDonate, type DonateEnv } from '../app/utils/donate'

const empty: DonateEnv = {
  sepaIban: '', sepaBic: '', sepaName: '', sepaBank: '',
  kofi: '', githubSponsors: '', donatepay: '', donationalerts: '',
  cryptoTron: '', cryptoTon: '', cryptoSolana: '', cryptoEvm: '',
}
const ruLinks = { donatepay: 'https://donatepay.ru/d/x', donationalerts: 'https://www.donationalerts.com/r/x' }
const LOCALES = ['sr', 'sr-cyrl', 'en', 'ru']

describe('donate availability', () => {
  it('is off everywhere when nothing is set', () => {
    for (const l of LOCALES) expect(resolveDonate(empty, l).enabled).toBe(false)
  })

  it('ru-only links keep the donate UI on ru and hide it elsewhere', () => {
    const cfg = { ...empty, ...ruLinks }
    expect(resolveDonate(cfg, 'ru').enabled).toBe(true)
    expect(resolveDonate(cfg, 'ru').links.map(l => l.id)).toEqual(['donatepay', 'donationalerts'])
    for (const l of ['sr', 'sr-cyrl', 'en']) {
      const d = resolveDonate(cfg, l)
      expect(d.enabled, l).toBe(false)
      expect(d.links, l).toEqual([])
    }
  })

  it('a method visible in every language enables all of them, ru adds its links', () => {
    const cfg = { ...empty, ...ruLinks, kofi: 'https://ko-fi.com/x' }
    for (const l of LOCALES) expect(resolveDonate(cfg, l).enabled, l).toBe(true)
    expect(resolveDonate(cfg, 'en').links.map(l => l.id)).toEqual(['kofi'])
    expect(resolveDonate(cfg, 'ru').links.map(l => l.id)).toEqual(['kofi', 'donatepay', 'donationalerts'])
  })

  it('ignores links that are not https URLs', () => {
    expect(resolveDonate({ ...empty, donatepay: 'http://donatepay.ru/x', donationalerts: 'donationalerts' }, 'ru').enabled).toBe(false)
  })

})
