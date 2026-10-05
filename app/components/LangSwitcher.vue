<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const route = useRoute()
const router = useRouter()

const NAMES: Record<string, string> = { sr: 'Crnogorski', en: 'English', ru: 'Русский' }

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
    aria-label="Language"
  >
    <template
      v-for="(l, i) in locales"
      :key="l.code"
    >
      <template v-if="i">
        |
      </template>
      <b
        v-if="l.code === locale"
        :lang="l.language"
      >{{ NAMES[l.code] }}</b>
      <button
        v-else
        type="button"
        class="link"
        :lang="l.language"
        @click="choose(l.code)"
      >
        {{ NAMES[l.code] }}
      </button>
    </template>
  </nav>
</template>

<style scoped>
.langs { font-size: 13px; color: #999; }
.langs b, .langs .link { color: #000; }
</style>
