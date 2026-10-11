<script setup lang="ts">
import { donateConfig } from '~/config/donate'

const { t } = useI18n()
const dialog = ref<HTMLDialogElement>()

const links = donateConfig.links.filter(l => l.url)
const wallets = donateConfig.crypto.filter(w => w.address)
const bank = donateConfig.bank
const hasBank = !!bank.iban && !!bank.name
const isEmpty = !links.length && !wallets.length && !hasBank

type Tab = 'bank' | 'crypto' | 'links'
const tabs = ([
  hasBank && 'bank',
  wallets.length && 'crypto',
  links.length && 'links',
].filter(Boolean) as Tab[])
const tab = ref<Tab>(tabs[0] ?? 'bank')

const openWallet = ref<string>()
const copiedId = ref<string>()
async function copy(id: string, text: string) {
  await navigator.clipboard.writeText(text)
  copiedId.value = id
  setTimeout(() => (copiedId.value = undefined), 1500)
}

defineExpose({ open: () => dialog.value?.showModal() })
</script>

<template>
  <dialog
    ref="dialog"
    class="donate"
    aria-labelledby="donate-title"
    @click.self="dialog?.close()"
  >
    <header>
      <h2 id="donate-title">
        {{ t('donate.title') }}
      </h2>
      <button
        type="button"
        class="btn quiet close"
        :aria-label="t('actions.close')"
        @click="dialog?.close()"
      >
        ✕
      </button>
    </header>
    <p class="lead">
      {{ t('donate.lead') }}
    </p>

    <p
      v-if="isEmpty"
      class="empty"
    >
      {{ t('donate.empty') }}
    </p>

    <template v-else>
      <fieldset
        v-if="tabs.length > 1"
        class="choice segmented tabs"
      >
        <legend class="sr-only">
          {{ t('donate.title') }}
        </legend>
        <label
          v-for="k in tabs"
          :key="k"
        ><input
          v-model="tab"
          type="radio"
          class="sr-only"
          name="donate-tab"
          :value="k"
        ><span>{{ t(`donate.tabs.${k}`) }}</span></label>
      </fieldset>

      <section
        v-if="tab === 'bank'"
        class="pane bank"
      >
        <p>{{ t('donate.bankHint') }}</p>
        <dl>
          <dt>{{ t('donate.name') }}</dt>
          <dd>{{ bank.name }}</dd>
          <dt>IBAN</dt>
          <dd class="mono">
            {{ bank.iban }}
            <button
              type="button"
              class="btn small"
              @click="copy('iban', bank.iban.replace(/\s/g, ''))"
            >
              {{ copiedId === 'iban' ? t('actions.copied') : t('actions.copy') }}<span class="sr-only">{{ ' IBAN' }}</span>
            </button>
          </dd>
          <template v-if="bank.bic">
            <dt>BIC</dt>
            <dd class="mono">
              {{ bank.bic }}
            </dd>
          </template>
          <dt>{{ t('slip.purpose') }}</dt>
          <dd>{{ bank.purpose }}</dd>
        </dl>
      </section>

      <section
        v-if="tab === 'crypto'"
        class="pane"
      >
        <ul class="wallets">
          <li
            v-for="w in wallets"
            :key="w.id"
            class="card"
          >
            <div class="wallet-head">
              <b>{{ w.coin }}</b>
              <span class="net">{{ w.network }}</span>
              <button
                type="button"
                class="btn small"
                :aria-expanded="openWallet === w.id"
                @click="openWallet = openWallet === w.id ? undefined : w.id"
              >
                QR<span class="sr-only">{{ ` ${w.coin} ${w.network}` }}</span>
              </button>
              <button
                type="button"
                class="btn small"
                @click="copy(w.id, w.address)"
              >
                {{ copiedId === w.id ? t('actions.copied') : t('actions.copy') }}<span class="sr-only">{{ ` ${w.coin} ${w.network}` }}</span>
              </button>
            </div>
            <code class="addr mono">{{ w.address }}</code>
            <QrCode
              v-if="openWallet === w.id"
              class="qr"
              :value="w.address"
              :label="`${w.coin} ${w.network}`"
            />
          </li>
        </ul>
        <p class="warn">
          {{ t('donate.cryptoWarn') }}
        </p>
      </section>

      <section
        v-if="tab === 'links'"
        class="pane links"
      >
        <a
          v-for="l in links"
          :key="l.id"
          :href="l.url"
          target="_blank"
          rel="noopener"
          class="btn"
        >{{ l.label }} ↗</a>
      </section>
    </template>
  </dialog>
</template>

<style scoped>
.donate {
  width: min(520px, 100vw - 32px);
  max-height: calc(100dvh - 32px);
  padding: var(--s-5);
  border: 0;
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-dialog);
}
.donate::backdrop { background: rgb(16 24 40 / .45); }
header { display: flex; justify-content: space-between; align-items: center; gap: var(--s-3); }
h2 { margin: 0; font-size: 1.25rem; }
.close { width: 44px; height: 44px; min-height: 44px; padding: 0; margin-right: -10px; color: var(--text-muted); font-size: var(--fs-lg); }
.lead { font-size: var(--fs-md); margin: var(--s-2) 0 var(--s-4); }
.empty { padding: var(--s-4); border: 1px dashed var(--border); border-radius: var(--r-sm); color: var(--text-muted); margin: 0; }

.tabs { margin-bottom: var(--s-4); }

.pane { display: grid; gap: var(--s-3); }
.pane > * { margin: 0; }
.bank dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 14px; margin: 0; }
.bank dt { color: var(--text-muted); }
.bank dd { margin: 0; display: flex; gap: var(--s-2); align-items: center; flex-wrap: wrap; overflow-wrap: anywhere; }
.bank p { color: var(--text-muted); }
.qr { width: 200px; padding: 10px; background: #fff; border-radius: var(--r-sm); justify-self: center; }

.wallets { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.wallets li { display: grid; gap: 6px; padding: var(--s-3); }
.wallet-head { display: flex; gap: var(--s-2); align-items: center; }
.net { color: var(--text-muted); font-size: var(--fs-sm); margin-right: auto; }
.addr { font-size: var(--fs-xs); overflow-wrap: anywhere; color: var(--text-muted); }
.warn { font-size: var(--fs-xs); color: var(--text-muted); }

.links { grid-template-columns: 1fr; }
@media (max-width: 599.98px) { .donate { padding: 20px; } }
</style>
