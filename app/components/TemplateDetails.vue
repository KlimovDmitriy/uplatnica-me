<script setup lang="ts">
/** Template intro, fees, payment tabs and how to fill the references; the chosen payment is v-model. */
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

    <table
      v-if="template.fees?.length"
      class="fees"
    >
      <tbody>
        <tr
          v-for="(f, i) in template.fees"
          :key="i"
        >
          <td>{{ l(f.label) }}</td>
          <td class="mono">
            {{ eur(f.amount) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="template.payments.length > 1"
      class="payments"
      role="tablist"
    >
      <button
        v-for="(p, i) in template.payments"
        :key="p.id"
        type="button"
        role="tab"
        :aria-selected="active === p.id"
        @click="active = p.id"
      >
        {{ i + 1 }}. {{ l(p.label) }}
      </button>
    </div>

    <template v-if="payment">
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
    </template>
  </div>
</template>

<style scoped>
.details { display: grid; gap: 12px; }
.details > * { margin: 0; }
.fees { border-collapse: collapse; max-width: 480px; font-size: 14px; }
.fees td { padding: 4px 16px 4px 0; border-bottom: 1px solid #e5e5e5; }
.fees td.mono { text-align: right; white-space: nowrap; }
.payments { display: flex; flex-wrap: wrap; gap: 4px 20px; border-bottom: 1px solid #ccc; }
.payments button {
  border: 0; background: none; font: inherit; font-size: 14px; color: #777; cursor: pointer;
  padding: 0 0 6px; margin-bottom: -1px; border-bottom: 2px solid transparent;
}
.payments button[aria-selected="true"] { color: #000; border-bottom-color: #000; }
.hint { font-size: 14px; }
</style>
