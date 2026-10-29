import { describe, expect, it } from 'vitest'
import { adsTxt, resolveAdSlot, type AdsEnv } from '../app/utils/ads'

const on: AdsEnv = { adsProvider: 'adsense', adsenseClient: 'ca-pub-1234567890123456', adsenseSlotAfterSlip: '111', adsenseSlotContent: '222' }

describe('ads', () => {
  it('renders nothing without a provider', () => {
    expect(resolveAdSlot({ ...on, adsProvider: '' }, 'content')).toBeNull()
    expect(adsTxt({ ...on, adsProvider: '' })).toBeNull()
  })

  it('resolves each slot with its own id', () => {
    expect(resolveAdSlot(on, 'after-slip')).toEqual({ client: 'ca-pub-1234567890123456', slot: '111' })
    expect(resolveAdSlot(on, 'content')).toEqual({ client: 'ca-pub-1234567890123456', slot: '222' })
  })

  it('needs a valid client and a numeric slot id', () => {
    expect(resolveAdSlot({ ...on, adsenseClient: 'pub-1' }, 'content')).toBeNull()
    expect(resolveAdSlot({ ...on, adsenseSlotContent: '' }, 'content')).toBeNull()
    expect(resolveAdSlot({ ...on, adsenseSlotContent: 'abc' }, 'content')).toBeNull()
  })

  it('writes ads.txt for AdSense only', () => {
    expect(adsTxt(on)).toBe('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n')
    expect(adsTxt({ ...on, adsenseClient: 'bad' })).toBeNull()
  })
})

it('accepts a numeric slot id (Nuxt parses numeric env values to numbers)', () => {
  const cfg = { adsProvider: 'adsense', adsenseClient: 'ca-pub-1', adsenseSlotAfterSlip: 111, adsenseSlotContent: 222 } as unknown as AdsEnv
  expect(resolveAdSlot(cfg, 'after-slip')?.slot).toBe('111')
})
