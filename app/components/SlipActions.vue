<script setup lang="ts">
const { t } = useI18n()
const { form, shareUrl, reset, fillExample, referenceRule } = useSlip()
const { blocked } = useSlipProblems()
/** The reason a blocked button is disabled: the error in the summary right above. */
const why = computed(() => (blocked.value ? slipErrorId('reference') : undefined))
const { put, editing, full, items } = useBatch()

const flash = ref('')
const busy = ref(false)
const note = (key: string) => {
  flash.value = t(`flash.${key}`)
  setTimeout(() => (flash.value = ''), 2000)
}

const print = () => window.print()

async function pdf() {
  busy.value = true
  try {
    downloadBlob(await slipsToPdf([renderSlipSvg(form.value)]), 'nalog-za-placanje.pdf')
  }
  finally { busy.value = false }
}

function addToBatch() {
  put(form.value, referenceRule.value)
  note('added')
}

async function share() {
  const url = shareUrl()
  if (typeof navigator.share === 'function' && matchMedia('(pointer: coarse)').matches) {
    navigator.share({ title: t('share.title'), url }).catch(() => {})
    return
  }
  await navigator.clipboard.writeText(url)
  note('linked')
}
</script>

<template>
  <div class="actions">
    <div class="buttons">
      <button
        type="button"
        class="btn primary pdf"
        :disabled="busy || blocked"
        :aria-describedby="why"
        @click="pdf"
      >
        {{ t('actions.pdf') }}
      </button>
      <button
        type="button"
        class="btn"
        :disabled="blocked"
        :aria-describedby="why"
        @click="print"
      >
        {{ t('actions.print') }}
      </button>
      <button
        type="button"
        class="btn"
        :disabled="blocked"
        :aria-describedby="why"
        @click="share"
      >
        {{ t('share.copyLink') }}
      </button>
      <button
        type="button"
        class="btn add"
        :disabled="(full && !editing) || blocked"
        :aria-describedby="why"
        @click="addToBatch"
      >
        {{ editing ? t('batch.save') : t('batch.add') }}<template v-if="items.length && !editing">
          ({{ items.length }})
        </template>
      </button>
      <span
        class="flash"
        role="status"
      ><template v-if="flash">✓ {{ flash }}</template></span>
    </div>
    <div class="quiet">
      <button
        type="button"
        class="btn quiet small"
        @click="fillExample"
      >
        {{ t('actions.example') }}
      </button>
      <button
        type="button"
        class="btn quiet small clear"
        @click="reset"
      >
        {{ t('actions.clear') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.actions { display: grid; gap: var(--s-3); }
.buttons { display: flex; flex-wrap: wrap; gap: var(--s-2); align-items: center; }
/* The live region stays in the DOM (an element added together with its text is often not announced). */
.flash:empty { position: absolute; }
.flash { margin-left: var(--s-2); }
.quiet { display: flex; flex-wrap: wrap; gap: var(--s-1) var(--s-2); }
@media (min-width: 600px) { .quiet { margin-inline: -10px; } }
.quiet .clear { margin-left: auto; color: var(--text-muted); }
.quiet .clear:hover { color: var(--text); }
@media (max-width: 599.98px) {
  .buttons { display: grid; grid-template-columns: 1fr 1fr; }
  .pdf, .add, .flash { grid-column: 1 / -1; }
  .flash { margin-left: 0; }
}
</style>
