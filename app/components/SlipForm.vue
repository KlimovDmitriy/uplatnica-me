<script setup lang="ts">
/** Plain stacked form for narrow screens, where the slip is too small to type into. */
import type { SlipForm } from '~/composables/useSlip'

const { t } = useI18n()
const { form, fieldError } = useSlip()

const invalid = (f: keyof SlipForm) => !!fieldError(f)
</script>

<template>
  <form
    class="slip-form"
    novalidate
    @submit.prevent
  >
    <label>{{ t('slip.payer') }}
      <textarea
        v-model="form.payer"
        rows="3"
        :placeholder="t('form.payerPlaceholder')"
        :class="{ invalid: invalid('payer') }"
      /></label>
    <label>{{ t('slip.purpose') }}
      <textarea
        v-model="form.purpose"
        rows="2"
        :class="{ invalid: invalid('purpose') }"
      /></label>
    <label>{{ t('slip.payee') }}
      <textarea
        v-model="form.payee"
        rows="3"
        :placeholder="t('form.payeePlaceholder')"
        :class="{ invalid: invalid('payee') }"
      /></label>
    <label v-if="form.kind === 'prenos'">{{ t('slip.payerAccount') }}
      <input
        v-model="form.payerAccount"
        inputmode="numeric"
        :class="{ invalid: invalid('payerAccount') }"
      ></label>
    <div class="row">
      <label class="code">{{ t('slip.model') }}
        <input
          v-model="form.debitModel"
          inputmode="numeric"
          maxlength="2"
          :class="{ invalid: invalid('debitModel') }"
        ></label>
      <label class="grow">{{ t('slip.debitReference') }}
        <input
          v-model="form.debitReference"
          :class="{ invalid: invalid('debitReference') }"
        ></label>
    </div>
    <div class="row">
      <label class="grow">{{ t('slip.amount') }}, EUR
        <input
          v-model="form.amount"
          inputmode="decimal"
          placeholder="0,00"
          :class="{ invalid: invalid('amount') }"
        ></label>
      <label class="code">{{ t('slip.paymentCode') }}
        <input
          v-model="form.paymentCode"
          inputmode="numeric"
          maxlength="3"
          :class="{ invalid: invalid('paymentCode') }"
        ></label>
    </div>
    <label>{{ t('slip.account') }}
      <input
        v-model="form.account"
        inputmode="numeric"
        placeholder="000-0000000000-00"
        :class="{ invalid: invalid('account') }"
      ></label>
    <div class="row">
      <label class="code">{{ t('slip.model') }}
        <input
          v-model="form.model"
          inputmode="numeric"
          maxlength="2"
          :class="{ invalid: invalid('model') }"
        ></label>
      <label class="grow">{{ t('slip.reference') }}
        <input
          v-model="form.reference"
          :class="{ invalid: invalid('reference') }"
        ></label>
    </div>
    <label>{{ t('slip.place') }}
      <input
        v-model="form.place"
        placeholder="Podgorica, 01.10.2026."
      ></label>
    <label
      v-if="form.kind === 'prenos'"
      class="check"
    ><input
      v-model="form.urgent"
      type="checkbox"
    > {{ t('slip.urgent') }} — {{ t('slip.urgentHint') }}</label>
  </form>
</template>

<style scoped>
.slip-form { display: grid; gap: 10px; }
label { display: grid; gap: 3px; font-size: 13px; }
.row { display: flex; gap: 10px; }
.code { width: 80px; flex: none; }
.grow { flex: 1; min-width: 0; }
.check { display: flex; gap: 6px; align-items: center; }
.invalid { border-color: #000; outline: 1px solid #000; }
</style>
