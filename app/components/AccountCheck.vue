<script setup lang="ts">
/** Account or IBAN → validity, bank, paper and electronic notation, IBAN. */
import { BANK_CODES } from '~/data/bankCodes'

const { t } = useI18n()

const input = ref('')
const account = computed(() => normalizeAccount(input.value))
const valid = computed(() => !!account.value && isAccountChecksumValid(account.value))
const bank = computed(() => {
  const code = account.value?.slice(0, 3) ?? input.value.replace(/\D/g, '').slice(0, 3)
  return code.length === 3 ? BANK_CODES.find(b => b.code === code) : undefined
})
/** Correct control digits when the user typed a wrong pair. */
const expected = computed(() => (account.value && !valid.value ? accountControl(account.value.slice(0, 16)) : ''))
</script>

<template>
  <div class="check">
    <label>
      {{ t('account.label') }}
      <input
        v-model="input"
        inputmode="text"
        placeholder="510-30280140-23 / ME25 …"
        autocomplete="off"
      >
    </label>
    <div
      v-if="input.trim()"
      aria-live="polite"
    >
      <p class="verdict">
        <template v-if="!account">
          {{ t('errors.account.invalid') }}
        </template>
        <template v-else-if="valid">
          ✓ {{ t('account.valid') }}
        </template>
        <template v-else>
          ✕ {{ t('account.invalid', { control: expected }) }}
        </template>
      </p>
      <dl>
        <template v-if="account">
          <dt>{{ t('account.paper') }}</dt>
          <dd class="mono">
            {{ formatAccount(account) }}
          </dd>
          <dt>{{ t('account.digits') }}</dt>
          <dd class="mono">
            {{ account }}
          </dd>
          <template v-if="valid">
            <dt>IBAN</dt>
            <dd class="mono">
              {{ formatIban(toIban(account)) }}
            </dd>
          </template>
        </template>
        <dt>{{ t('account.bank') }}</dt>
        <dd>{{ bank?.name ?? t('account.unknownBank') }}</dd>
      </dl>
    </div>
    <details>
      <summary>{{ t('account.banks') }}</summary>
      <table>
        <tbody>
          <tr
            v-for="b in BANK_CODES"
            :key="b.code"
          >
            <td class="mono">
              {{ b.code }}
            </td>
            <td>{{ b.name }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>

<style scoped>
.check { display: grid; gap: 10px; max-width: 560px; }
label { display: grid; gap: 3px; font-size: 13px; }
.verdict { margin: 0 0 6px; font-weight: 700; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; margin: 0; font-size: 14px; }
dt { color: #777; }
dd { margin: 0; }
summary { cursor: pointer; font-size: 13px; }
table { border-collapse: collapse; font-size: 13px; margin-top: 6px; }
td { padding: 3px 12px 3px 0; border-bottom: 1px solid #e5e5e5; }
</style>
