<script setup lang="ts">
/** Template intro, fees, payment choice and how to fill the references; the chosen payment is v-model. */
import type { PaymentTemplate } from '~/data/templates'

const props = defineProps<{ template: PaymentTemplate }>()
const active = defineModel<string>({ required: true })

const { t } = useI18n()
const l = useLocalized()

const payment = computed(() => props.template.payments.find(p => p.id === active.value))
const eur = (n: number) => `${formatAmount(n)} EUR`
</script>

<template>
  <div class="details">
    <p class="lead">
      {{ l(template.intro) }}
    </p>

    <div
      v-if="template.fees?.length"
      class="table-scroll"
    >
      <table class="table fees">
        <tbody>
          <tr
            v-for="(f, i) in template.fees"
            :key="i"
          >
            <td>{{ l(f.label) }}</td>
            <td class="num">
              {{ eur(f.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <fieldset
      v-if="template.payments.length > 1"
      class="choice pills"
    >
      <legend>{{ t('form.payment') }}</legend>
      <label
        v-for="(p, i) in template.payments"
        :key="p.id"
        class="chip"
      >
        <input
          v-model="active"
          type="radio"
          class="sr-only"
          name="template-payment"
          :value="p.id"
        >
        {{ i + 1 }}. {{ l(p.label) }}
      </label>
    </fieldset>

    <div
      v-if="payment && (payment.referenceHint || payment.tool)"
      class="note neutral"
    >
      <p
        v-if="payment.referenceHint"
        class="hint"
      >
        {{ l(payment.referenceHint) }}
      </p>
      <ReferenceBuilder
        v-if="payment.tool"
        :tool="payment.tool"
      />
    </div>
  </div>
</template>

<style scoped>
.details { display: grid; gap: var(--s-4); }
.details > * { margin: 0; }
.fees { max-width: 640px; }
.hint { margin: 0; font-size: var(--fs-sm); }
</style>
