<script setup lang="ts">
import type { SlipForm } from '~/composables/useSlip'

const { t } = useI18n()
const { form, fieldError, errors } = useSlip()

const FIELDS: (keyof SlipForm)[] = [
  'payer', 'purpose', 'payee', 'payerAccount', 'debitModel', 'debitReference',
  'amount', 'paymentCode', 'account', 'model', 'reference',
]

// Required fields are reported once the slip has an amount or an account, not on an empty form.
const started = computed(() => !!(form.value.amount.trim() || form.value.account.trim()))

const problems = computed(() => FIELDS
  .map((field) => {
    const e = fieldError(field) ?? (started.value && !String(form.value[field]).trim()
      ? errors.value.find(x => x === `${field}.required`)
      : undefined)
    return e && { field, label: t(`slip.${field === 'debitModel' ? 'model' : field}`), text: t(`errors.${e}`, LIMITS) }
  })
  .filter(Boolean) as { field: keyof SlipForm, label: string, text: string }[])
</script>

<template>
  <ul
    v-if="problems.length"
    class="errors"
    role="alert"
  >
    <li
      v-for="p in problems"
      :key="p.field"
    >
      <b>{{ p.label }}:</b> {{ p.text }}
    </li>
  </ul>
</template>

<style scoped>
.errors { margin: 0; padding: 8px 12px 8px 28px; border: 1px solid #000; font-size: 13px; }
.errors li + li { margin-top: 2px; }
</style>
