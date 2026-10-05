<script setup lang="ts">
import type { PaymentTemplate } from '~/data/templates'

const props = defineProps<{ template: PaymentTemplate }>()
const { t } = useI18n()
const l = useLocalized()

const [year, month] = props.template.checkedAt.split('-')
</script>

<template>
  <div class="sources">
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
  </div>
</template>

<style scoped>
h2 { font-size: 15px; margin: 16px 0 4px; }
ul { margin: 0; padding-left: 20px; font-size: 14px; }
.checked { font-size: 13px; color: #777; }
</style>
