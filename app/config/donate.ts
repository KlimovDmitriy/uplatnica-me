/**
 * "Support the author" settings. Empty values are hidden on the site,
 * so fill only what you actually use.
 */
export interface CryptoWallet {
  id: string
  coin: string
  network: string
  address: string
}

export interface DonateLink {
  id: string
  label: string
  url: string
}

export const donateConfig = {
  /** Bank transfer: shown as IBAN to copy. Montenegro has no payment QR standard yet. */
  bank: {
    iban: '', // e.g. 'ME25 5100 0000 0000 1234 56' or an EU / Serbian IBAN
    name: '', // e.g. 'Ime Prezime'
    bic: '',
    purpose: 'Podrška autoru',
  },

  // Buy Me a Coffee is left out on purpose: it does not pay out to Serbia or Montenegro.
  links: [
    { id: 'kofi', label: 'Ko-fi', url: '' }, // needs PayPal or Stripe on the receiving side
    { id: 'donatepay', label: 'DonatePay', url: '' },
    { id: 'donationalerts', label: 'DonationAlerts', url: '' },
  ] satisfies DonateLink[],

  crypto: [
    { id: 'usdt-trc20', coin: 'USDT', network: 'TRC-20 (Tron)', address: '' },
    { id: 'usdt-ton', coin: 'USDT', network: 'TON', address: '' },
    { id: 'usdc-erc20', coin: 'USDC', network: 'ERC-20 (Ethereum)', address: '' },
    { id: 'usdc-sol', coin: 'USDC', network: 'Solana', address: '' },
    { id: 'ton', coin: 'TON', network: 'TON', address: '' },
    { id: 'btc', coin: 'BTC', network: 'Bitcoin', address: '' },
    { id: 'eth', coin: 'ETH', network: 'Ethereum', address: '' },
  ] satisfies CryptoWallet[],
}
