/**
 * Visitors never see a language prefix and their language is remembered in localStorage.
 *
 * - Arriving on "/ru/x" (e.g. from Google): the page is already Russian; we remember "ru"
 *   and show "/x" in the address bar. The router stays on the "/ru/x" route, so links on
 *   the page keep pointing to Russian pages and are hidden again after each navigation.
 * - Arriving on "/x": after hydration we switch to the saved language, or on the first
 *   visit to the browser's language.
 * Crawlers are left alone: no language switch and no address bar changes.
 */
const KEY = 'uplatnica-me:lang'
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
      const wanted = saved && (i18n.availableLocales as string[]).includes(saved) ? saved : fromBrowser()
      if (wanted !== i18n.locale.value) await i18n.setLocale(wanted as typeof i18n.locale.value)
    }
    hidePrefix()

    router.afterEach(() => nextTick(hidePrefix))
    watch(i18n.locale, save)
  })
})
