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
    <div class="inner">
      <header>
        <h2 id="donate-title">
          {{ t('donate.title') }}
        </h2>
        <button
          type="button"
          class="close"
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
        <div
          v-if="tabs.length > 1"
          class="tabs"
          role="tablist"
        >
          <button
            v-for="k in tabs"
            :key="k"
            type="button"
            role="tab"
            :aria-selected="tab === k"
            @click="tab = k"
          >
            {{ t(`donate.tabs.${k}`) }}
          </button>
        </div>

        <section
          v-if="tab === 'bank'"
          class="panel bank"
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
                {{ copiedId === 'iban' ? t('actions.copied') : t('actions.copy') }}
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
          class="panel"
        >
          <ul class="wallets">
            <li
              v-for="w in wallets"
              :key="w.id"
            >
              <div class="wallet-head">
                <b>{{ w.coin }}</b>
                <span class="net">{{ w.network }}</span>
                <button
                  type="button"
                  class="btn small ghost"
                  :aria-expanded="openWallet === w.id"
                  @click="openWallet = openWallet === w.id ? undefined : w.id"
                >
                  QR
                </button>
                <button
                  type="button"
                  class="btn small"
                  @click="copy(w.id, w.address)"
                >
                  {{ copiedId === w.id ? t('actions.copied') : t('actions.copy') }}
                </button>
              </div>
              <code class="addr">{{ w.address }}</code>
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
          class="panel links"
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
    </div>
  </dialog>
</template>

<style scoped>
.donate {
  width: min(520px, calc(100vw - 32px));
  max-height: calc(100dvh - 32px);
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text);
}
.donate::backdrop { background: rgb(0 0 0 / .5); }
.inner { padding: 20px 22px 24px; }
header { display: flex; justify-content: space-between; align-items: center; }
h2 { margin: 0; font-size: 20px; }
.close { border: 0; background: none; font-size: 18px; color: var(--muted); cursor: pointer; padding: 4px 8px; }
.lead { color: var(--muted); margin: 6px 0 16px; }
.empty { padding: 16px; border: 1px dashed var(--border); border-radius: 4px; color: var(--muted); }

.tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid var(--border); }
.tabs button {
  border: 0; background: none; padding: 8px 12px; cursor: pointer; color: var(--muted);
  font: inherit; font-weight: 600; border-bottom: 2px solid transparent; margin-bottom: -1px;
}
.tabs button[aria-selected="true"] { color: var(--text); border-bottom-color: var(--text); }

.panel { display: grid; gap: 12px; }
.bank p { margin: 0; color: var(--muted); }
.bank dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 14px; margin: 0; }
.bank dt { color: var(--muted); }
.bank dd { margin: 0; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; overflow-wrap: anywhere; }
.qr { width: 200px; padding: 10px; background: #fff; border-radius: 4px; justify-self: center; }

.wallets { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.wallets li { display: grid; gap: 6px; padding: 12px; border: 1px solid var(--border); border-radius: 4px; }
.wallet-head { display: flex; gap: 8px; align-items: center; }
.net { color: var(--muted); font-size: 13px; margin-right: auto; }
.addr { font-size: 12.5px; overflow-wrap: anywhere; color: var(--muted); }
.warn { font-size: 12.5px; color: var(--muted); margin: 0; }

.links { grid-template-columns: 1fr; }
.links .btn { justify-content: center; }
</style>
