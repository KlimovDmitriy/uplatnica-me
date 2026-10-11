import type { SlipForm } from './useSlip'

/** i18n key of a slip field's label: the two model fields and the two references have their own wording. */
export function slipFieldLabel(field: keyof SlipForm): string {
  const KEYS: Record<keyof SlipForm, string> = {
    kind: 'kind',
    payer: 'payer',
    purpose: 'purpose',
    payee: 'payee',
    payerAccount: 'payerAccount',
    debitModel: 'modelDebit',
    debitReference: 'debitReference',
    amount: 'amount',
    paymentCode: 'paymentCode',
    account: 'account',
    model: 'modelCredit',
    reference: 'reference',
    place: 'place',
    urgent: 'urgent',
  }
  return `slip.${KEYS[field]}`
}

const FIELDS: (keyof SlipForm)[] = [
  'payer', 'purpose', 'payee', 'payerAccount', 'debitModel', 'debitReference',
  'amount', 'paymentCode', 'account', 'model', 'reference',
]

export interface SlipProblem { field: keyof SlipForm, label: string, text: string, code: string }

/**
 * What the error summary lists: validation errors, plus "required" once the slip has an amount or an
 * account (not on an empty form). The fields use it for aria-invalid / aria-describedby.
 */
export function useSlipProblems() {
  const { t } = useI18n()
  const { form, fieldError, errors } = useSlip()

  const started = computed(() => !!(form.value.amount.trim() || form.value.account.trim()))

  const problems = computed(() => FIELDS
    .map((field) => {
      const e = fieldError(field) ?? (started.value && !String(form.value[field]).trim()
        ? errors.value.find(x => x === `${field}.required`)
        : undefined)
      return e && { field, label: t(slipFieldLabel(field)), text: t(`errors.${e}`, LIMITS), code: e }
    })
    .filter(Boolean) as SlipProblem[])

  const problemFor = (field: keyof SlipForm) => problems.value.find(p => p.field === field)

  return { problems, problemFor }
}

/** id of a field's entry in the error summary (aria-describedby target). */
export const slipErrorId = (field: keyof SlipForm) => `err-${field}`
