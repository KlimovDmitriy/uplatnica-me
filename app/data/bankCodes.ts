export interface BankCode {
  /** First three digits of the account. */
  code: string
  name: string
}

/** CBCG, participants of the RTGS system, checked 2026-09 (docs/research.md §3.3). */
export const BANK_CODES_SOURCE = 'https://www.cbcg.me/me/kljucne-funkcije/platni-promet/platni-sistem/rtgs-sistem'

export const BANK_CODES: BankCode[] = [
  { code: '510', name: 'Crnogorska komercijalna banka (CKB)' },
  { code: '520', name: 'Hipotekarna banka' },
  { code: '530', name: 'NLB Banka' },
  { code: '535', name: 'Prva banka Crne Gore' },
  { code: '540', name: 'Erste Bank' },
  { code: '555', name: 'Addiko Bank' },
  { code: '560', name: 'Universal Capital Bank' },
  { code: '565', name: 'Lovćen banka' },
  { code: '570', name: 'Zapad banka' },
  { code: '575', name: 'Ziraat Bank Montenegro' },
  { code: '580', name: 'Adriatic Bank' },
  { code: '805', name: 'Uprava prihoda i carina (carinski prihodi)' },
  { code: '820', name: 'Uprava prihoda i carina (porezi i doprinosi)' },
  { code: '825', name: 'Ministarstvo unutrašnjih poslova' },
  { code: '832', name: 'Centralni račun državnog trezora' },
  { code: '840', name: 'Uprava policije' },
  { code: '907', name: 'Centralna banka Crne Gore' },
]
