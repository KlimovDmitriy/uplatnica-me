import { describe, expect, it } from 'vitest'
import { splitLangPrefix, withLangPrefix } from '../shared/utils/lang'

describe('language prefix', () => {
  it('splits known prefixes only', () => {
    expect(splitLangPrefix('/ru/pdv')).toEqual({ code: 'ru', path: '/pdv' })
    expect(splitLangPrefix('/en/')).toEqual({ code: 'en', path: '/' })
    expect(splitLangPrefix('/porez-na-nepokretnosti')).toEqual({ code: null, path: '/porez-na-nepokretnosti' })
    expect(splitLangPrefix('/rules')).toEqual({ code: null, path: '/rules' })
  })

  it('adds a prefix except for the default language', () => {
    expect(withLangPrefix('ru', '/')).toBe('/ru')
    expect(withLangPrefix('ru', '/pdv')).toBe('/ru/pdv')
    expect(withLangPrefix('sr', '/pdv')).toBe('/pdv')
    expect(withLangPrefix(null, '/')).toBe('/')
  })
})
