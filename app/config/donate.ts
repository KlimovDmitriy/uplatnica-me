/**
 * "Support the author": static parts only (amounts, texts, network metadata).
 * Personal details (accounts, IBAN, wallets, links) come from NUXT_PUBLIC_DONATE_* env vars at
 * build time, see .env.example and app/composables/useDonate.ts.
 */
export interface DonateLink {
  id: 'kofi' | 'github-sponsors' | 'donatepay' | 'donationalerts'
  label: string
  /** Shown only in these languages; omitted = everywhere. */
  locales?: string[]
  /** Key under `donate.` of a short hint shown next to the link (exists in those languages only). */
  hint?: string
}

export type CryptoFamilyId = 'tron' | 'ton' | 'solana' | 'evm'

export interface CryptoNetwork {
  id: string
  name: string
  /** Stablecoins accepted on this network. */
  coins: string[]
}

/** One address per family: every EVM network below shares the same one. */
export interface CryptoFamily {
  id: CryptoFamilyId
  networks: CryptoNetwork[]
}

export const donateConfig = {
  /** SEPA transfer in EUR to a foreign-currency IBAN (Montenegro has no payment QR standard yet). Plain ASCII: SEPA banks may reject č, ć, š. */
  sepa: {
    purpose: 'Podrska autoru',
  },

  // Buy Me a Coffee is left out on purpose: it does not pay out to Serbia or Montenegro.
  links: [
    { id: 'kofi', label: 'Ko-fi' }, // needs PayPal or Stripe on the receiving side
    { id: 'github-sponsors', label: 'GitHub Sponsors' },
    // Russian-speaking visitors only: they pay with Russian bank cards, which Ko-fi and GitHub don't take.
    { id: 'donatepay', label: 'DonatePay', locales: ['ru'], hint: 'ruCardsHint' },
    { id: 'donationalerts', label: 'DonationAlerts', locales: ['ru'], hint: 'ruCardsHint' },
  ] satisfies DonateLink[],

  // Low-fee stablecoin networks only.
  crypto: [
    { id: 'tron', networks: [{ id: 'tron', name: 'Tron (TRC-20)', coins: ['USDT'] }] },
    { id: 'ton', networks: [{ id: 'ton', name: 'TON', coins: ['USDT'] }] },
    { id: 'solana', networks: [{ id: 'solana', name: 'Solana (SPL)', coins: ['USDT', 'USDC'] }] },
    {
      id: 'evm',
      networks: [
        { id: 'polygon', name: 'Polygon', coins: ['USDT', 'USDC'] },
        { id: 'base', name: 'Base', coins: ['USDC'] },
        { id: 'bsc', name: 'BNB Smart Chain (BEP-20)', coins: ['USDT', 'USDC'] },
        { id: 'arbitrum', name: 'Arbitrum One', coins: ['USDT', 'USDC'] },
      ],
    },
  ] satisfies CryptoFamily[],
}
