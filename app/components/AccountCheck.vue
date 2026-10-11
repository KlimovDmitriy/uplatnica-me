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
    <div class="field">
      <label for="acc">{{ t('account.label') }}</label>
      <input
        id="acc"
        v-model="input"
        class="mono"
        inputmode="text"
        placeholder="510-30280140-23 / ME25 …"
        autocomplete="off"
        :aria-invalid="input.trim() && !valid ? 'true' : undefined"
        :aria-describedby="input.trim() ? 'acc-verdict' : undefined"
      >
    </div>
    <div
      class="result"
      aria-live="polite"
    >
      <template v-if="input.trim()">
        <p
          id="acc-verdict"
          class="verdict"
          :class="valid ? 'ok' : 'bad'"
        >
          <template v-if="!account">
            ✕ {{ t('errors.account.invalid') }}
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
      </template>
    </div>
    <details class="disclosure">
      <summary>{{ t('account.banks') }}</summary>
      <div class="table-scroll">
        <table class="table">
          <tbody>
            <tr
              v-for="b in BANK_CODES"
              :key="b.code"
            >
              <td class="mono code">
                {{ b.code }}
              </td>
              <td>{{ b.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </div>
</template>

<style scoped>
.check { display: grid; gap: var(--s-3); max-width: 560px; }
.result { display: grid; gap: var(--s-3); }
.result:empty { display: none; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; margin: 0; }
dt { color: var(--text-muted); font-size: var(--fs-sm); }
dd { margin: 0; overflow-wrap: anywhere; }
td.code { width: 64px; }
@media (max-width: 599.98px) {
  dl { grid-template-columns: 1fr; gap: 2px; }
  dd + dt { margin-top: var(--s-2); }
}
</style>
