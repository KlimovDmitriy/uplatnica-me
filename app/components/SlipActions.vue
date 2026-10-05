<script setup lang="ts">
const { t } = useI18n()
const { form, shareUrl, reset, fillExample } = useSlip()
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
  put(form.value)
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
    <p class="buttons">
      <button
        type="button"
        class="btn"
        @click="print"
      >
        {{ t('actions.print') }}
      </button>
      <button
        type="button"
        class="btn"
        :disabled="busy"
        @click="pdf"
      >
        {{ t('actions.pdf') }}
      </button>
      <button
        type="button"
        class="btn"
        :disabled="full && !editing"
        @click="addToBatch"
      >
        {{ editing ? t('batch.save') : t('batch.add') }}<template v-if="items.length && !editing">
          ({{ items.length }})
        </template>
      </button>
      <span
        v-if="flash"
        class="flash"
        role="status"
      >{{ flash }}</span>
    </p>
    <p class="links">
      <button
        type="button"
        class="link"
        @click="share"
      >
        {{ t('share.copyLink') }}
      </button> ·
      <button
        type="button"
        class="link"
        @click="fillExample"
      >
        {{ t('actions.example') }}
      </button> ·
      <button
        type="button"
        class="link"
        @click="reset"
      >
        {{ t('actions.clear') }}
      </button>
    </p>
  </div>
</template>

<style scoped>
.actions p { margin: 0; }
.buttons { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.links { margin-top: 8px !important; font-size: 13px; color: #777; }
.flash { font-size: 13px; margin-left: 6px; }
</style>
