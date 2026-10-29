/**
 * Replaces the WebSite/WebPage defaults of nuxt-schema-org (turned off in nuxt.config.ts).
 * Its i18n variant builds WebSite.workTranslation / translationOfWork from localePath('index'),
 * which is "/" for every language in our no_prefix setup, so the same @id was listed three
 * times (and on /en pages the site was a translation of itself). The language versions are
 * linked with hreflang in usePageSeo.ts instead.
 *
 * The author (a Person) publishes the site and the app (see pages/[[slug]].vue).
 */
const AUTHOR = { name: 'Dmitrii Klimov', url: 'https://github.com/KlimovDmitriy' }

export default defineNuxtPlugin({
  name: 'uplatnica-me:schema-website',
  dependsOn: ['nuxt-schema-org:init', 'nuxt-schema-org:meta'],
  setup(nuxtApp) {
    const siteConfig = useSiteConfig()
    const siteUrl = useSiteUrl()
    const pageUrl = usePageUrl()
    const route = useRoute()
    const websiteId = `${siteUrl}/#website`
    const authorId = `${siteUrl}/#author`
    const language = () => nuxtApp.$i18n.localeProperties.value.language || ''

    useSchemaOrg([
      definePerson({ '@id': authorId, 'name': AUTHOR.name, 'url': AUTHOR.url, 'sameAs': [AUTHOR.url] }),
      defineWebSite({
        '@id': websiteId,
        'url': `${siteUrl}/`,
        'name': () => toValue(siteConfig.name) || '',
        'inLanguage': language,
        'publisher': { '@id': authorId },
      }),
      defineWebPage({
        url: () => {
          const { code, path } = splitLangPrefix(route.path)
          return pageUrl(code, path)
        },
        isPartOf: { '@id': websiteId },
        inLanguage: language,
      }),
    ])
  },
})
