<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()
const route = useRoute()
const router = useRouter()

const NAMES: Record<string, string> = { sr: 'Crnogorski', en: 'English', ru: 'Русский' }
const SHORT: Record<string, string> = { sr: 'CG', en: 'EN', ru: 'RU' }

async function choose(code: string) {
  await setLocale(code as typeof locale.value)
  // On a language-prefixed route, move to the same page of the chosen language,
  // otherwise links on the page would keep pointing to the old one.
  const { code: current, path } = splitLangPrefix(route.path)
  if (current) await router.replace({ path: withLangPrefix(code, path), query: route.query, hash: route.hash })
}
</script>

<template>
  <nav
    class="langs"
    :aria-label="t('nav.languages')"
  >
    <template
      v-for="l in locales"
      :key="l.code"
    >
      <span
        v-if="l.code === locale"
        class="lang"
        aria-current="true"
        :lang="l.language"
      ><span class="full">{{ NAMES[l.code] }}</span><span
        class="short"
        aria-hidden="true"
      >{{ SHORT[l.code] }}</span></span>
      <button
        v-else
        type="button"
        class="lang"
        :lang="l.language"
        @click="choose(l.code)"
      >
        <span class="full">{{ NAMES[l.code] }}</span><span
          class="short"
          aria-hidden="true"
        >{{ SHORT[l.code] }}</span>
      </button>
    </template>
  </nav>
</template>

<style scoped>
.langs { display: flex; flex-wrap: wrap; gap: var(--s-1); }
.lang {
  display: inline-flex; align-items: center; min-height: 36px; padding: 0 var(--s-2);
  border: 0; border-radius: var(--r-sm); background: none;
  font: inherit; font-size: var(--fs-sm); color: var(--text-muted); cursor: pointer;
}
button.lang:hover { color: var(--text); background: var(--surface-2); }
.lang[aria-current] {
  color: var(--text); font-weight: var(--fw-semibold); cursor: default;
  text-decoration: underline 2px var(--accent); text-underline-offset: 6px;
}
.short { display: none; }
@media (pointer: coarse), (max-width: 959.98px) { .lang { min-height: 44px; } }
@media (max-width: 599.98px) {
  .full {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
  }
  .short { display: inline; }
}
</style>
