/**
 * Visitors never see a language prefix and their language is remembered in localStorage.
 *
 * - Arriving on "/ru/x" (e.g. from Google): the page is already Russian; we remember "ru"
 *   and show "/x" in the address bar. The router stays on the "/ru/x" route, so links on
 *   the page keep pointing to Russian pages and are hidden again after each navigation.
 * - Arriving on "/x": after hydration we switch to the saved language. On the first visit
 *   nothing is switched (that would re-render the page and shift the layout): the browser's
 *   language is offered through the dismissible bar in components/LangSuggest.vue.
 * Crawlers are left alone: no language switch and no address bar changes.
 */
const KEY = 'uplatnica-me:lang'
const HINT_KEY = 'uplatnica-me:lang-hint'
const BOT = /bot|crawl|spider|slurp|google|yandex|bing|baidu|duckduck|facebookexternalhit|lighthouse|headless/i

function fromBrowser(): string {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const lower = tag.toLowerCase()
    if (['sr', 'hr', 'bs', 'me', 'cnr', 'sh'].some(p => lower.startsWith(p))) return 'sr'
    if (lower.startsWith('ru') || lower.startsWith('uk') || lower.startsWith('be')) return 'ru'
    if (lower.startsWith('en')) return 'en'
  }
  return 'sr'
}

function save(code: string) {
  try { localStorage.setItem(KEY, code) }
  catch { /* storage unavailable */ }
}

/** Replace only the visible URL; Vue Router keeps its own state. */
function hidePrefix() {
  const { code, path } = splitLangPrefix(window.location.pathname)
  if (!code) return
  history.replaceState(history.state, '', path + window.location.search + window.location.hash)
}

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n
  const router = useRouter()
  const suggested = useLangSuggestion()

  onNuxtReady(async () => {
    if (BOT.test(navigator.userAgent)) return
    const { code } = splitLangPrefix(router.currentRoute.value.path)
    if (code) {
      save(code)
    }
    else {
      let saved: string | null = null
      try { saved = localStorage.getItem(KEY) }
      catch { /* storage unavailable */ }
      if (saved && (i18n.availableLocales as string[]).includes(saved)) {
        if (saved !== i18n.locale.value) await i18n.setLocale(saved as typeof i18n.locale.value)
      }
      else {
        let dismissed = false
        try { dismissed = !!localStorage.getItem(HINT_KEY) }
        catch { /* storage unavailable */ }
        const wanted = fromBrowser()
        if (!dismissed && wanted !== i18n.locale.value) suggested.value = wanted
      }
    }
    hidePrefix()

    router.afterEach(() => nextTick(hidePrefix))
    watch(i18n.locale, save)
  })
})
