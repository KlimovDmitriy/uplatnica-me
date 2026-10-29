/**
 * "/ru/x" renders in Russian, on the server (prerender) and on the client before hydration,
 * so both produce identical HTML. Unprefixed URLs keep the default language here;
 * locale-storage.client.ts switches them to the visitor's language after hydration.
 */
export default defineNuxtPlugin({
  name: 'uplatnica-me:locale-route',
  dependsOn: ['i18n:plugin', 'i18n:plugin:route-locale-detect'],
  async setup(nuxtApp) {
    const { code } = splitLangPrefix(stripBase(useRequestURL().pathname, useRuntimeConfig().app.baseURL))
    if (code && code !== nuxtApp.$i18n.locale.value) {
      await nuxtApp.$i18n.setLocale(code)
    }
  },
})
