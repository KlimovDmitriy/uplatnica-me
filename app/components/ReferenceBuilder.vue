<script setup lang="ts">
/**
 * Model 18 poziv na broj: PIB or JMB, a dash and the municipality code (or a fixed revenue code).
 * Writes the result straight into the slip; with `localAccount` also the municipality's account and name.
 */
import type { ReferenceTool } from '~/data/templates'

const props = defineProps<{ tool?: ReferenceTool }>()

const { t } = useI18n()
const { form } = useSlip()
const { write } = useSlipWriter()

const id = ref('')
const code = ref('')
const uid = useId()

const digits = computed(() => id.value.replace(/\D/g, ''))
const idKind = computed(() => (digits.value.length === 13 ? 'jmb' : digits.value.length === 8 ? 'pib' : null))
const idValid = computed(() => (idKind.value === 'jmb' ? isJmbValid(digits.value) : idKind.value === 'pib' ? isPibValid(digits.value) : false))
const idInvalid = computed(() => !!idKind.value && !idValid.value)
const suffix = computed(() => props.tool?.code ?? code.value)
const municipality = computed(() => findMunicipality(code.value))
const account = computed(() => (props.tool?.localAccount ? municipality.value?.accounts[props.tool.localAccount] : undefined))
const noAccount = computed(() => !!props.tool?.localAccount && !!municipality.value && !account.value)
const reference = computed(() => (idKind.value && suffix.value ? buildModel18(digits.value, suffix.value) : ''))

/** Everything this builder puts on the slip for the current input. */
const output = computed(() => {
  const m = municipality.value
  return {
    ...(reference.value ? { model: '18', reference: reference.value } : {}),
    ...(m && props.tool?.localAccount
      ? { account: account.value ?? '', payee: [m.payee, props.tool.payeeLine].filter(Boolean).join('\n') }
      : {}),
  }
})
// Fields that drop out of the output (municipality unset, ID cleared or cut short) are taken back,
// unless the user has edited them since; fields the builder never wrote are left alone.
watch(output, write)
// A new template (other tool) starts from scratch.
watch(() => props.tool, () => { code.value = '' })
</script>

<template>
  <div class="builder">
    <div class="field">
      <label :for="`${uid}-id`">{{ t('reference.id') }}</label>
      <input
        :id="`${uid}-id`"
        v-model="id"
        class="mono"
        inputmode="numeric"
        maxlength="15"
        placeholder="0205973210263"
        autocomplete="off"
        :aria-invalid="idInvalid ? 'true' : undefined"
        :aria-describedby="`${uid}-id-msg`"
      >
      <small
        :id="`${uid}-id-msg`"
        :class="idInvalid ? 'error-text' : 'hint'"
      >{{ idInvalid ? `✕ ${t(`reference.${idKind}Invalid`)}` : t('reference.idHint') }}</small>
    </div>
    <div
      v-if="!tool?.code"
      class="field"
    >
      <label :for="`${uid}-municipality`">{{ t('reference.municipality') }}</label>
      <select
        :id="`${uid}-municipality`"
        v-model="code"
        :aria-describedby="noAccount ? `${uid}-municipality-msg` : undefined"
      >
        <option value="">
          {{ t('reference.choose') }}
        </option>
        <option
          v-for="m in MUNICIPALITIES"
          :key="m.code"
          :value="m.code"
        >
          {{ m.name }} ({{ m.code }})
        </option>
      </select>
      <small
        v-if="noAccount"
        :id="`${uid}-municipality-msg`"
        class="hint"
      >{{ t('reference.noAccount') }}</small>
    </div>
    <div
      class="result"
      aria-live="polite"
    >
      <p v-if="reference">
        {{ t('slip.reference') }}: <b class="mono">18 {{ reference }}</b>
        <template v-if="account">
          · {{ t('slip.account') }}: <b class="mono">{{ form.account }}</b>
        </template>
      </p>
    </div>
  </div>
</template>

<style scoped>
.builder { display: grid; grid-template-columns: 1fr; gap: var(--s-3) var(--s-4); }
.result { grid-column: 1 / -1; }
.result p { margin: 0; overflow-wrap: anywhere; }
@media (min-width: 960px) { .builder { grid-template-columns: 1fr 1fr; } }
</style>
