<script setup lang="ts">
import type { SlipForm } from '~/composables/useSlip'

const props = defineProps<{
  /** Prefills the slip (template pages). Applied on the server too, so the prerendered HTML shows it. */
  preset?: Partial<SlipForm>
  /** Restore/save the local draft (home page only). Shared links are read on every page. */
  persist?: boolean
}>()

const { t } = useI18n()
const { form, setForm, fromLink, restore } = useSlip()

if (props.preset) setForm(props.preset)
// Another payment tab of the template: its preset replaces the slip, but what the user typed into
// fields the new preset does not set (payer, amount, reference…) carries over.
watch(() => props.preset, (preset, old) => {
  if (preset) setForm({ ...changedFields(form.value, old), ...preset })
})
restore(!!props.persist)
</script>

<template>
  <section class="generator">
    <p class="options no-print">
      <label
        v-for="k in (['uplata', 'prenos'] as const)"
        :key="k"
      ><input
        v-model="form.kind"
        type="radio"
        :value="k"
      > {{ t(`kinds.${k}.title`) }} <small>{{ t(`kinds.${k}.hint`) }}</small></label>
    </p>

    <p
      v-if="fromLink"
      class="note no-print"
      role="status"
    >
      {{ t('share.loaded') }}
    </p>

    <SlipEditor class="wide-only no-print" />
    <SlipForm class="narrow-only no-print" />
    <SlipPreview class="print-area narrow-only" />

    <SlipErrors class="no-print" />
    <SlipActions class="no-print" />
    <BatchPanel class="no-print" />
  </section>
</template>

<style scoped>
.generator { display: grid; gap: 12px; }
.options { margin: 0; display: flex; flex-wrap: wrap; gap: 6px 24px; }
.options label { display: inline-flex; gap: 5px; align-items: center; cursor: pointer; }
.options small { color: #777; }
.options input { margin: 0; }
.note { margin: 0; padding: 6px 10px; border: 1px solid #000; }
</style>
