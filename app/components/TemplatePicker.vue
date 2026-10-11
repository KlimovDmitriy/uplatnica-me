<script setup lang="ts">
/** Ready-made orders grouped by category. Plain links, so every template is a crawlable URL. */
import { TEMPLATES, type TemplateCategory } from '~/data/templates'

defineProps<{
  current?: string
  /** Below a template's own order: "Other ready-made orders". */
  more?: boolean
}>()
const { t } = useI18n()
const l = useLocalized()

const ORDER: TemplateCategory[] = ['taxes', 'local', 'fines', 'documents']
const groups = ORDER
  .map(category => ({ category, items: TEMPLATES.filter(tpl => tpl.category === category) }))
  .filter(g => g.items.length)
</script>

<template>
  <nav
    class="picker card"
    :aria-labelledby="more ? 'picker-more' : 'picker-title'"
  >
    <h2 :id="more ? 'picker-more' : 'picker-title'">
      {{ t(more ? 'templates.more' : 'templates.title') }}
    </h2>
    <div
      v-for="g in groups"
      :key="g.category"
      class="group"
    >
      <h3 class="label">
        {{ t(`templates.categories.${g.category}`) }}
      </h3>
      <ul class="chips">
        <li
          v-for="tpl in g.items"
          :key="tpl.slug"
        >
          <span
            v-if="tpl.slug === current"
            class="chip"
            aria-current="page"
          >{{ l(tpl.name) }}</span>
          <LangLink
            v-else
            :to="`/${tpl.slug}`"
            class="chip"
          >
            {{ l(tpl.name) }}
          </LangLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.group { display: grid; gap: var(--s-2); padding: var(--s-3) 0; border-top: 1px solid var(--border); }
.group:first-of-type { border-top: 0; padding-top: 0; }
.group:last-child { padding-bottom: 0; }
.label { margin: 0; font-size: var(--fs-sm); font-weight: var(--fw-semibold); line-height: var(--lh-snug); color: var(--text-muted); }
.chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--s-2); }
@media (min-width: 960px) {
  .group { grid-template-columns: 13rem 1fr; gap: var(--s-3) var(--s-5); align-items: baseline; }
}
</style>
