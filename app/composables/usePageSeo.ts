interface PageSeo {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** Name of this page in the breadcrumb trail below "home"; omit on the home page. */
  breadcrumb?: MaybeRefOrGetter<string>
}

const OG_LOCALE: Record<string, string> = { sr: 'sr_ME', en: 'en_US', ru: 'ru_RU' }

/**
 * Absolute URL of a page in a language: "https://host/uplatnica/en/model-97/". Every page is
 * prerendered as a folder with index.html, which static hosts (GitHub Pages) serve at "/x/" and
 * redirect "/x" to, so canonical, hreflang, sitemap and internal links all end in a slash.
 */
export function usePageUrl() {
  const siteUrl = useSiteUrl()
  return (code: string | null, path: string) => siteUrl + ensureTrailingSlash(withLangPrefix(code, path))
}

/**
 * Title, description, canonical, hreflang alternates for every language version,
 * Open Graph/Twitter and breadcrumbs. The language comes from the route prefix, which is
 * what crawlers see; visitors on unprefixed URLs keep the Montenegrin canonical.
 */
export function usePageSeo({ title, description, breadcrumb }: PageSeo) {
  const { t, locales } = useI18n()
  const siteUrl = useSiteUrl()
  const pageUrl = usePageUrl()
  const route = useRoute()

  const parts = computed(() => splitLangPrefix(route.path))
  const pageLocale = computed(() => parts.value.code ?? DEFAULT_LOCALE)
  const url = (code: string) => pageUrl(code, parts.value.path)
  const ogImage = computed(() => `${siteUrl}/og/${pageLocale.value}.png`)

  useHead({
    link: () => [
      { rel: 'canonical', href: url(pageLocale.value) },
      ...locales.value.map(l => ({ rel: 'alternate' as const, hreflang: l.language!, href: url(l.code) })),
      { rel: 'alternate' as const, hreflang: 'x-default', href: url(DEFAULT_LOCALE) },
    ],
  })

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogUrl: () => url(pageLocale.value),
    ogLocale: () => OG_LOCALE[pageLocale.value],
    ogLocaleAlternate: () => [...new Set(Object.values(OG_LOCALE))].filter(v => v !== OG_LOCALE[pageLocale.value]),
    ogSiteName: () => t('meta.appName'),
    ogImage,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/png',
    ogImageAlt: () => `${t('meta.appName')}: ${t('hero.title')}`,
    twitterCard: 'summary_large_image',
    twitterImage: ogImage,
    twitterImageAlt: () => `${t('meta.appName')}: ${t('hero.title')}`,
  })

  if (breadcrumb) {
    useSchemaOrg([
      defineBreadcrumb({
        itemListElement: [
          { name: () => t('nav.generator'), item: () => pageUrl(pageLocale.value, '/') },
          { name: breadcrumb, item: () => url(pageLocale.value) },
        ],
      }),
    ])
  }
}
