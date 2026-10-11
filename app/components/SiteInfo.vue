<script setup lang="ts">
/** Footer content (info links, disclaimer, donate): the desktop bar and the mobile dialog both render it. */
defineEmits<{ donate: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="info">
    <p class="links">
      <LangLink to="/#poziv-na-broj">
        {{ t('reference.title') }}
      </LangLink>
      <LangLink to="/#provjera-racuna">
        {{ t('account.title') }}
      </LangLink>
    </p>
    <p
      class="disclaimer"
      :title="t('footer.disclaimer')"
    >
      {{ t('footer.disclaimer') }}
    </p>
    <button
      type="button"
      class="btn small donate"
      @click="$emit('donate')"
    >
      {{ t('donate.button') }}
    </button>
  </div>
</template>

<style scoped>
.info { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-3); font-size: var(--fs-sm); }
.links { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-4); margin: 0; }
.links > * { display: inline-flex; align-items: center; min-height: 24px; }
.disclaimer { margin: 0; max-width: var(--measure); font-size: var(--fs-xs); color: var(--text-muted); }
.donate { order: -1; }
/* Desktop: the footer is a one-line bar fixed to the viewport bottom (height: --footer-h). */
@media (min-width: 960px) {
  .info { flex-direction: row; align-items: center; gap: var(--s-5); height: 100%; }
  .links { flex: none; flex-wrap: nowrap; gap: var(--s-4); }
  .disclaimer {
    flex: 1; min-width: 0; line-height: 1.3;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .donate { order: 0; flex: none; }
}
</style>
