import { describe, expect, it } from 'vitest'
import { ensureTrailingSlash, normalizeBase, siteOrigin, stripBase, withBase } from '../shared/utils/base'

describe('base path', () => {
  it('normalizes to slashes on both sides', () => {
    expect(normalizeBase()).toBe('/')
    expect(normalizeBase('')).toBe('/')
    expect(normalizeBase('/')).toBe('/')
    expect(normalizeBase('uplatnica')).toBe('/uplatnica/')
    expect(normalizeBase('/uplatnica')).toBe('/uplatnica/')
    expect(normalizeBase('/uplatnica/')).toBe('/uplatnica/')
  })

  it('strips the base from a location path', () => {
    expect(stripBase('/uplatnica/ru/x', '/uplatnica/')).toBe('/ru/x')
    expect(stripBase('/uplatnica/', '/uplatnica/')).toBe('/')
    expect(stripBase('/uplatnica', '/uplatnica/')).toBe('/')
    expect(stripBase('/other/x', '/uplatnica/')).toBe('/other/x')
    expect(stripBase('/ru/x', '/')).toBe('/ru/x')
  })

  it('adds the base to a router path', () => {
    expect(withBase('/uplatnica/', '/ru/x')).toBe('/uplatnica/ru/x')
    expect(withBase('/uplatnica/', '/')).toBe('/uplatnica/')
    expect(withBase('/', '/ru/x')).toBe('/ru/x')
  })
})

describe('site origin', () => {
  it('drops the base path that the site URL repeats', () => {
    expect(siteOrigin('https://x.github.io/uplatnica', '/uplatnica/')).toBe('https://x.github.io')
    expect(siteOrigin('https://x.github.io/uplatnica/', '/uplatnica/')).toBe('https://x.github.io')
    expect(siteOrigin('https://uplatnica.rs', '/')).toBe('https://uplatnica.rs')
    expect(siteOrigin('https://uplatnica.rs/', '/')).toBe('https://uplatnica.rs')
    expect(siteOrigin('https://uplatnica.rs', '/uplatnica/')).toBe('https://uplatnica.rs')
  })
  it('ends page paths with a slash once', () => {
    expect(ensureTrailingSlash('/')).toBe('/')
    expect(ensureTrailingSlash('/en')).toBe('/en/')
    expect(ensureTrailingSlash('/en/pasos/')).toBe('/en/pasos/')
  })
})
