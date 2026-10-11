<script setup lang="ts">
import type { PaymentTemplate } from '~/data/templates'

const props = defineProps<{ template: PaymentTemplate }>()
const { t } = useI18n()
const l = useLocalized()

const [year, month] = props.template.checkedAt.split('-')
</script>

<template>
  <article class="prose">
    <template v-if="template.notes.length">
      <h2>{{ t('templates.notes') }}</h2>
      <ul>
        <li
          v-for="(n, i) in template.notes"
          :key="i"
        >
          {{ l(n) }}
        </li>
      </ul>
    </template>
    <h2>{{ t('templates.sources') }}</h2>
    <ul>
      <li
        v-for="s in template.sources"
        :key="s.url"
      >
        <a
          :href="s.url"
          target="_blank"
          rel="noopener"
        >{{ s.label }}</a>
      </li>
    </ul>
    <p class="checked">
      {{ t('templates.checked', { date: `${month}/${year}` }) }}
    </p>
  </article>
</template>

<style scoped>
.checked { font-size: var(--fs-xs); color: var(--text-muted); }
</style>
