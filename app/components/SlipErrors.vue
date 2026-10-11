<script setup lang="ts">
import type { SlipForm } from '~/composables/useSlip'

const { t } = useI18n()
const { problems } = useSlipProblems()
const errorId = slipErrorId

/** Focuses the field in whichever is shown: the slip editor (e-*) or the stacked form (f-*). */
function focusField(field: keyof SlipForm) {
  const el = [`e-${field}`, `f-${field}`]
    .map(id => document.getElementById(id))
    .find(e => e && e.offsetParent !== null)
  el?.focus()
}
</script>

<template>
  <div aria-live="polite">
    <div
      v-if="problems.length"
      class="error-summary"
    >
      <p class="title">
        {{ t('errors.summary') }}
      </p>
      <ul>
        <li
          v-for="p in problems"
          :key="p.field"
        >
          <button
            type="button"
            class="link"
            @click="focusField(p.field)"
          >
            {{ p.label }}</button>: <span :id="errorId(p.field)">{{ p.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
