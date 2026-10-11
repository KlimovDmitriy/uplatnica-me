<script setup lang="ts">
const { t } = useI18n()
const dialog = ref<HTMLDialogElement>()

// The layout renders this dialog only when at least one method is configured.
const { sepa, links, networks } = useDonate()

type Tab = 'sepa' | 'card' | 'crypto'
const tabs = ([
  sepa && 'sepa',
  links.length && 'card',
  networks.length && 'crypto',
].filter(Boolean) as Tab[])
const tab = ref<Tab>(tabs[0] ?? 'sepa')

const sepaFields = computed(() => sepa
  ? [
      { id: 'name', label: t('donate.name'), value: sepa.name },
      { id: 'iban', label: 'IBAN', value: groupIban(sepa.iban), copy: sepa.iban, mono: true },
      { id: 'bic', label: 'BIC', value: sepa.bic, mono: true },
      ...(sepa.bank ? [{ id: 'bank', label: t('donate.bank'), value: sepa.bank }] : []),
      { id: 'purpose', label: t('slip.purpose'), value: sepa.purpose },
    ]
  : [])

const networkId = ref(networks[0]?.id)
const network = computed(() => networks.find(n => n.id === networkId.value) ?? networks[0])

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
      v-if="tab === 'sepa' && sepa"
      class="pane sepa"
    >
      <p>{{ t('donate.sepaHint') }}</p>
      <QrCode
        class="qr"
        :value="sepa.payload"
        label="EPC QR"
      />
      <dl>
        <template
          v-for="f in sepaFields"
          :key="f.id"
        >
          <dt>{{ f.label }}</dt>
          <dd :class="{ mono: f.mono }">
            {{ f.value }}
            <button
              type="button"
              class="btn small"
              @click="copy(f.id, f.copy ?? f.value)"
            >
              {{ copiedId === f.id ? t('actions.copied') : t('actions.copy') }}<span class="sr-only">{{ ` ${f.label}` }}</span>
            </button>
          </dd>
        </template>
      </dl>
    </section>

    <section
      v-if="tab === 'card'"
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

    <section
      v-if="tab === 'crypto' && network"
      class="pane crypto"
    >
      <fieldset class="choice pills">
        <legend class="sr-only">
          {{ t('donate.network') }}
        </legend>
        <label
          v-for="n in networks"
          :key="n.id"
          class="chip"
        ><input
          v-model="networkId"
          type="radio"
          class="sr-only"
          name="donate-network"
          :value="n.id"
        >{{ n.name }}</label>
      </fieldset>
      <p class="accepted">
        {{ t('donate.accepted', { coins: network.coins.join(', '), network: network.name }) }}
      </p>
      <QrCode
        class="qr"
        :value="network.address"
        :label="t('donate.addressQr', { network: network.name })"
      />
      <div class="address">
        <code class="addr mono">{{ network.address }}</code>
        <button
          type="button"
          class="btn small"
          @click="copy('crypto', network.address)"
        >
          {{ copiedId === 'crypto' ? t('actions.copied') : t('actions.copy') }}<span class="sr-only">{{ ` ${t('donate.address')} ${network.name}` }}</span>
        </button>
      </div>
      <p class="warn">
        {{ t('donate.cryptoWarn') }}
      </p>
      <p
        v-if="network.family === 'evm'"
        class="warn"
      >
        {{ t('donate.cryptoEvm') }}
      </p>
    </section>
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

.tabs { margin-bottom: var(--s-4); }

.pane { display: grid; gap: var(--s-3); }
.pane > * { margin: 0; }
.sepa dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 14px; margin: 0; }
.sepa dt { color: var(--text-muted); }
.sepa dd { margin: 0; display: flex; gap: var(--s-2); align-items: center; flex-wrap: wrap; overflow-wrap: anywhere; }
.sepa p { color: var(--text-muted); }
.crypto .choice { justify-content: center; }
.qr { width: 200px; padding: 10px; background: #fff; border-radius: var(--r-sm); justify-self: center; }

.accepted { color: var(--text-muted); font-size: var(--fs-sm); }
.address { display: flex; gap: var(--s-2); align-items: center; justify-content: space-between; }
.addr { font-size: var(--fs-xs); overflow-wrap: anywhere; color: var(--text-muted); }
.warn { font-size: var(--fs-xs); color: var(--text-muted); }

.links { grid-template-columns: 1fr; }
@media (max-width: 599.98px) { .donate { padding: 20px; } }
</style>
