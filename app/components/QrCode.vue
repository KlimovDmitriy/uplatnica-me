<script setup lang="ts">
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{
  value: string
  /** Error correction level; M is enough for wallet addresses. */
  level?: 'L' | 'M' | 'Q' | 'H'
  label?: string
}>(), { level: 'M', label: 'QR' })

const svg = ref('')

watch(() => [props.value, props.level] as const, async ([value, level]) => {
  svg.value = value
    ? await QRCode.toString(value, { type: 'svg', errorCorrectionLevel: level, margin: 0 })
    : ''
}, { immediate: true })
</script>

<template>
  <div
    class="qr"
    role="img"
    :aria-label="label"
    v-html="svg"
  />
</template>

<style scoped>
.qr { line-height: 0; }
.qr :deep(svg) { width: 100%; height: auto; display: block; }
.qr :deep(path:first-child) { fill: #fff; }
</style>
