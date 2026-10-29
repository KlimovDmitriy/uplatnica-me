<script setup lang="ts">
import type { SlipForm } from '~/composables/useSlip'
import type { ReferenceRule } from '~/data/templates'

const props = defineProps<{
  /** Prefills the slip (template pages). Applied on the server too, so the prerendered HTML shows it. */
  preset?: Partial<SlipForm>
  /** The preset's reference may not stay empty (see referenceRule in data/templates.ts). */
  referenceRule?: ReferenceRule | null
  /** Restore/save the local draft (home page only). Shared links are read on every page. */
  persist?: boolean
}>()

const { t } = useI18n()
const { form, setForm, fromLink, restore } = useSlip()

if (props.preset) setForm(props.preset, props.referenceRule)
// Another payment choice of the template: its preset replaces the slip, but what the user typed into
// fields the new preset does not set (payer, amount, reference…) carries over.
watch(() => props.preset, (preset, old) => {
  if (preset) setForm({ ...changedFields(form.value, old), ...preset }, props.referenceRule)
})
restore(!!props.persist)
</script>

<template>
  <section
    class="panel generator"
    aria-labelledby="generator-title"
  >
    <!-- Not shown: the form speaks for itself, but the outline needs an h2 above "Preview" (h3). -->
    <h2
      id="generator-title"
      class="sr-only"
    >
      {{ t('nav.generator') }}
    </h2>
    <div class="head no-print">
      <fieldset class="choice segmented kind">
        <legend class="sr-only">
          {{ t('form.kind') }}
        </legend>
        <label
          v-for="k in (['uplata', 'prenos'] as const)"
          :key="k"
        ><input
          v-model="form.kind"
          type="radio"
          class="sr-only"
          name="slip-kind"
          :value="k"
        ><span>{{ t(`kinds.${k}.title`) }}</span><small>{{ t(`kinds.${k}.hint`) }}</small></label>
      </fieldset>
    </div>

    <p class="hint wide-only no-print">
      {{ t('form.editorHint') }}
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
    <h3 class="preview-title narrow-only no-print">
      {{ t('form.preview') }}
    </h3>
    <SlipPreview class="print-area narrow-only" />

    <SlipErrors class="no-print" />
    <SlipActions class="no-print" />
    <AdSlot name="after-slip" />
    <BatchPanel class="no-print" />
  </section>
</template>

<style scoped>
.generator { display: grid; gap: var(--s-4); }
.generator > * { margin: 0; min-width: 0; }
.kind { width: max-content; min-width: 360px; }
.hint { font-size: var(--fs-sm); color: var(--text-muted); margin-top: calc(-1 * var(--s-2)) !important; }
.preview-title { font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text-muted); margin-bottom: calc(-1 * var(--s-2)) !important; }
@media (max-width: 1199.98px) { .generator { padding: var(--s-4); } }
@media (max-width: 599.98px) {
  .generator { margin-inline: calc(-1 * var(--gutter)); border-inline: 0; border-radius: 0; padding: var(--s-4); }
  .kind { width: 100%; min-width: 0; }
}
</style>
