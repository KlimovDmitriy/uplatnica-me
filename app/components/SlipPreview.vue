<script setup lang="ts">
/** The current slip drawn by renderSlipSvg: scales on screen, prints at 210 × 99 mm. */
const { form } = useSlip()
const svg = computed(() => renderSlipSvg(form.value))
</script>

<template>
  <div
    class="slip"
    role="img"
    aria-label="Nalog platioca"
    v-html="svg"
  />
</template>

<style scoped>
.slip { line-height: 0; border: 1px solid var(--border); }
.slip :deep(svg) { width: 100%; height: auto; display: block; }

@media print {
  .slip { border: 0; border-bottom: 1px dashed #000; width: 210mm; }
  .slip :deep(svg) { width: 210mm; height: 99mm; }
}
</style>
