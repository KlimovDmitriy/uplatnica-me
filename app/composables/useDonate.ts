import { donateConfig, type CryptoNetwork, type CryptoFamilyId } from '~/config/donate'

export interface DonateNetwork extends CryptoNetwork {
  family: CryptoFamilyId
  address: string
}

/**
 * The enabled "support the author" methods. Details come from NUXT_PUBLIC_DONATE_* env vars at
 * build time (nuxt.config.ts); an empty or invalid method is left out, and with no method at all
 * `enabled` is false and the donate button and dialog are not rendered.
 */
export function useDonate() {
  const cfg = useRuntimeConfig().public.donate
  const clean = (v: string) => (v ?? '').trim()

  // SEPA needs a valid IBAN and a BIC (Serbia is outside the EEA, so the EPC QR must carry it).
  const iban = normalizeIban(clean(cfg.sepaIban))
  const bic = clean(cfg.sepaBic).toUpperCase()
  const sepaName = clean(cfg.sepaName)
  const sepa = sepaName && isIbanChecksumValid(iban) && isBic(bic)
    ? {
        name: sepaName,
        iban,
        bic,
        bank: clean(cfg.sepaBank),
        purpose: donateConfig.sepa.purpose,
        payload: buildEpcQr({ bic, name: sepaName, iban, text: donateConfig.sepa.purpose }),
      }
    : null

  const urls: Record<string, string> = { 'kofi': clean(cfg.kofi), 'github-sponsors': clean(cfg.githubSponsors) }
  const links = donateConfig.links
    .map(l => ({ ...l, url: urls[l.id] ?? '' }))
    .filter(l => /^https:\/\/\S+$/.test(l.url))

  const addresses: Record<CryptoFamilyId, string> = {
    tron: clean(cfg.cryptoTron),
    ton: clean(cfg.cryptoTon),
    solana: clean(cfg.cryptoSolana),
    evm: clean(cfg.cryptoEvm),
  }
  const networks: DonateNetwork[] = donateConfig.crypto.flatMap(f =>
    addresses[f.id] ? f.networks.map(n => ({ ...n, family: f.id, address: addresses[f.id] })) : [])

  return { sepa, links, networks, enabled: !!(sepa || links.length || networks.length) }
}
