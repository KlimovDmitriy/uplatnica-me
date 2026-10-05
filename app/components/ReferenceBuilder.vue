<script setup lang="ts">
/**
 * Model 18 poziv na broj: PIB or JMB, a dash and the municipality code (or a fixed revenue code).
 * Writes the result straight into the slip; with `localAccount` also the municipality's account and name.
 */
import type { ReferenceTool } from '~/data/templates'

const props = defineProps<{ tool?: ReferenceTool }>()

const { t } = useI18n()
const { form, patch } = useSlip()

const id = ref('')
const code = ref('')

const digits = computed(() => id.value.replace(/\D/g, ''))
const idKind = computed(() => (digits.value.length === 13 ? 'jmb' : digits.value.length === 8 ? 'pib' : null))
const idValid = computed(() => (idKind.value === 'jmb' ? isJmbValid(digits.value) : idKind.value === 'pib' ? isPibValid(digits.value) : false))
const suffix = computed(() => props.tool?.code ?? code.value)
const municipality = computed(() => findMunicipality(code.value))
const account = computed(() => (props.tool?.localAccount ? municipality.value?.accounts[props.tool.localAccount] : undefined))
const noAccount = computed(() => !!props.tool?.localAccount && !!municipality.value && !account.value)
const reference = computed(() => (idKind.value && suffix.value ? buildModel18(digits.value, suffix.value) : ''))

watch(reference, (r) => { if (r) patch({ model: '18', reference: r }) })
watch(municipality, (m) => {
  if (!m || !props.tool?.localAccount) return
  patch({ account: account.value ?? '', payee: [m.payee, props.tool.payeeLine].filter(Boolean).join('\n') })
})
// A new template (other tool) starts from scratch.
watch(() => props.tool, () => { code.value = '' })
</script>

<template>
  <div class="builder">
    <label>
      {{ t('reference.id') }}
      <input
        v-model="id"
        inputmode="numeric"
        maxlength="15"
        placeholder="0205973210263"
        autocomplete="off"
        :class="{ invalid: idKind && !idValid }"
      >
      <small v-if="idKind && !idValid">{{ t(`reference.${idKind}Invalid`) }}</small>
      <small v-else>{{ t('reference.idHint') }}</small>
    </label>
    <label v-if="!tool?.code">
      {{ t('reference.municipality') }}
      <select v-model="code">
        <option value="">{{ t('reference.choose') }}</option>
        <option
          v-for="m in MUNICIPALITIES"
          :key="m.code"
          :value="m.code"
        >{{ m.name }} ({{ m.code }})</option>
      </select>
      <small v-if="noAccount">{{ t('reference.noAccount') }}</small>
    </label>
    <p
      v-if="reference"
      class="result"
    >
      {{ t('slip.reference') }}: <b class="mono">18 {{ reference }}</b>
      <template v-if="account">
        · {{ t('slip.account') }}: <b class="mono">{{ form.account }}</b>
      </template>
    </p>
  </div>
</template>

<style scoped>
.builder { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
label { display: grid; gap: 3px; font-size: 13px; align-content: start; }
small { color: #777; }
.invalid { outline: 1px solid #000; }
.result { grid-column: 1 / -1; margin: 0; font-size: 14px; }
@media (max-width: 640px) { .builder { grid-template-columns: 1fr; } }
</style>
