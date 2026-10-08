import type { NalogError, NalogInput, NalogKind } from '#shared/utils/nalog'

export interface SlipForm {
  kind: NalogKind
  /** Hitnost: instant transfer, prenos only. */
  urgent: boolean
  payer: string
  purpose: string
  payee: string
  payerAccount: string
  debitModel: string
  debitReference: string
  amount: string
  paymentCode: string
  account: string
  model: string
  reference: string
  /** Mjesto i datum podnošenja. */
  place: string
}

const DRAFT_KEY = 'uplatnica-me:draft:v1'

export const emptyForm = (): SlipForm => ({
  kind: 'uplata',
  urgent: false,
  payer: '',
  purpose: '',
  payee: '',
  payerAccount: '',
  debitModel: '',
  debitReference: '',
  amount: '',
  paymentCode: '',
  account: '',
  model: '',
  reference: '',
  place: '',
})

const exampleForm = (): Partial<SlipForm> => ({
  payer: 'Marko Marković\nBeogradska 15\nPodgorica',
  purpose: 'Porez na nepokretnosti za 2026.',
  payee: 'Glavni grad Podgorica\nPorez na nepokretnosti',
  amount: '85,40',
  account: '510-30280140-23',
  debitReference: '2026',
  model: '18',
  reference: '0205973210263-302',
})

/** Accepts "1.234,56", "1234,56", "1234.56" and "1 234". */
export function parseAmount(raw: string): number {
  let s = raw.replace(/[\s ]/g, '')
  if (!s) return Number.NaN
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if (/\.\d{3}(\.|$)/.test(s)) s = s.replace(/\./g, '')
  return /^\d+(\.\d{1,2})?$/.test(s) ? Number(s) : Number.NaN
}

/** 1234.5 → "1.234,50", the notation of the official samples. */
export function formatAmount(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
}

export function toNalogInput(form: SlipForm): NalogInput {
  return { ...form, amount: parseAmount(form.amount) }
}

export function useSlip() {
  const form = useState<SlipForm>('slip-form', emptyForm)
  /** Set when the form was filled from a shared link, so the UI can say so. */
  const fromLink = useState<boolean>('slip-from-link', () => false)

  const errors = computed<NalogError[]>(() => validateNalog(toNalogInput(form.value)))

  /** Error to show next to a field; stays silent while the field is empty. */
  function fieldError(field: keyof SlipForm): NalogError | undefined {
    if (!String(form.value[field]).trim()) return undefined
    return errors.value.find(e => e.startsWith(`${field}.`))
  }

  function setForm(values: Partial<SlipForm> = {}) {
    form.value = { ...emptyForm(), ...values }
  }

  function patch(values: Partial<SlipForm>) {
    form.value = { ...form.value, ...values }
  }

  const reset = () => setForm({ kind: form.value.kind })
  const fillExample = () => setForm({ ...exampleForm(), kind: form.value.kind })

  function shareUrl(): string {
    const url = new URL(window.location.href)
    url.hash = `${SHARE_PARAM}=${encodeSlip(form.value)}`
    return url.toString()
  }

  /**
   * Home page only: restores the slip from a shared link or the local draft,
   * then keeps the draft in localStorage.
   */
  function persistDraft() {
    onMounted(() => {
      const shared = new URLSearchParams(window.location.hash.slice(1)).get(SHARE_PARAM)
      const fromHash = shared ? decodeSlip(shared) : null
      if (fromHash) {
        setForm(fromHash)
        fromLink.value = true
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form.value)) }
        catch { /* storage unavailable */ }
        history.replaceState(history.state, '', window.location.pathname + window.location.search)
      }
      else {
        try {
          const saved = localStorage.getItem(DRAFT_KEY)
          if (saved) setForm(JSON.parse(saved))
        }
        catch { /* storage unavailable */ }
      }
      watch(form, (v) => {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)) }
        catch { /* storage unavailable */ }
      }, { deep: true })
    })
  }

  return { form, fromLink, errors, fieldError, setForm, patch, reset, fillExample, shareUrl, persistDraft }
}
