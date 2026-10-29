export type AdSlotName = 'after-slip' | 'content'

export interface AdsEnv {
  adsProvider: string
  adsenseClient: string
  adsenseSlotAfterSlip: string
  adsenseSlotContent: string
}

// Nuxt parses env values, so a numeric slot id arrives as a number.
const str = (v: unknown) => String(v ?? '').trim()

/** The AdSense publisher id ("ca-pub-…") when ads are on and configured, else null. */
export function adsenseClient(cfg: AdsEnv): string | null {
  const client = str(cfg.adsenseClient)
  return cfg.adsProvider === 'adsense' && /^ca-pub-\d+$/.test(client) ? client : null
}

/**
 * What a slot renders: null (nothing at all) unless the provider is "adsense" with a valid client id
 * and a numeric slot id for this slot. The same for every language.
 */
export function resolveAdSlot(cfg: AdsEnv, name: AdSlotName): { client: string, slot: string } | null {
  const client = adsenseClient(cfg)
  const slot = str(name === 'after-slip' ? cfg.adsenseSlotAfterSlip : cfg.adsenseSlotContent)
  return client && /^\d+$/.test(slot) ? { client, slot } : null
}

/** Body of /ads.txt, or null when AdSense is off. */
export function adsTxt(cfg: AdsEnv): string | null {
  const client = adsenseClient(cfg)
  return client ? `google.com, ${client.slice(3)}, DIRECT, f08c47fec0942fa0\n` : null
}
