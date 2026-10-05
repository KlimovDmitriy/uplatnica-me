<script setup lang="ts">
/** Ready-made orders grouped by category. Plain links, so every template is a crawlable URL. */
import { TEMPLATES, type TemplateCategory } from '~/data/templates'

defineProps<{ current?: string }>()
const { t } = useI18n()
const l = useLocalized()

const ORDER: TemplateCategory[] = ['taxes', 'local', 'fines', 'documents']
const groups = ORDER
  .map(category => ({ category, items: TEMPLATES.filter(tpl => tpl.category === category) }))
  .filter(g => g.items.length)
</script>

<template>
  <nav
    class="picker"
    :aria-label="t('templates.title')"
  >
    <p
      v-for="g in groups"
      :key="g.category"
    >
      <b>{{ t(`templates.categories.${g.category}`) }}:</b>&nbsp;
      <template
        v-for="(tpl, i) in g.items"
        :key="tpl.slug"
      >
        <template v-if="i">
          ·
        </template>
        <b v-if="tpl.slug === current">{{ l(tpl.name) }}</b>
        <LangLink
          v-else
          :to="`/${tpl.slug}`"
        >
          {{ l(tpl.name) }}
        </LangLink>
      </template>
    </p>
    <p v-if="current">
      <LangLink to="/">
        ← {{ t('templates.blank') }}
      </LangLink>
    </p>
  </nav>
</template>

<style scoped>
.picker { font-size: 13px; line-height: 1.7; }
.picker p { margin: 0; }
</style>
