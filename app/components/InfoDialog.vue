<script setup lang="ts">
/** Mobile counterpart of the desktop footer bar: the same SiteInfo in a native <dialog>. */
const emit = defineEmits<{ donate: [] }>()
const { t } = useI18n()
const dialog = ref<HTMLDialogElement>()
const shown = ref(false)

function open() {
  shown.value = true
  dialog.value?.showModal()
}
function close() {
  dialog.value?.close()
}
// Links navigate within this layout, so the dialog would stay open over the new page.
function onBodyClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('a')) close()
}
function onDonate() {
  close()
  emit('donate')
}

defineExpose({ open })
</script>

<template>
  <dialog
    ref="dialog"
    class="info-dialog no-print"
    aria-labelledby="info-title"
    @click.self="close"
    @close="shown = false"
  >
    <header>
      <h2 id="info-title">
        {{ t('nav.info') }}
      </h2>
      <button
        type="button"
        class="btn quiet close"
        :aria-label="t('actions.close')"
        @click="close"
      >
        ✕
      </button>
    </header>
    <!-- Mounted only while open, so the prerendered page does not repeat the footer links. -->
    <div
      v-if="shown"
      @click="onBodyClick"
    >
      <SiteInfo @donate="onDonate" />
    </div>
  </dialog>
</template>

<style scoped>
.info-dialog {
  width: min(520px, 100vw - 32px);
  max-height: calc(100dvh - 32px);
  padding: var(--s-5);
  border: 0;
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-dialog);
}
.info-dialog::backdrop { background: rgb(16 24 40 / .45); }
header { display: flex; justify-content: space-between; align-items: center; gap: var(--s-3); margin-bottom: var(--s-3); }
h2 { margin: 0; font-size: 1.25rem; }
.close { width: 44px; height: 44px; min-height: 44px; padding: 0; margin-right: -10px; color: var(--text-muted); font-size: var(--fs-lg); }
@media (max-width: 599.98px) { .info-dialog { padding: 20px; } }
</style>
