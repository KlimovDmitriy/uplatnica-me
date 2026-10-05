interface PageSeo {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** Breadcrumb trail below "home"; omit on the home page. */
  breadcrumb?: { name: MaybeRefOrGetter<string>, item?: string }[]
}

const OG_LOCALE: Record<string, string> = { sr: 'sr_ME', en: 'en_US', ru: 'ru_RU' }

/**
 * Title, description, canonical, hreflang alternates for every language version,
 * Open Graph/Twitter and breadcrumbs. The language comes from the route prefix, which is
 * what crawlers see; visitors on unprefixed URLs keep the Montenegrin canonical.
 */
export function usePageSeo({ title, description, breadcrumb }: PageSeo) {
  const { t, locales } = useI18n()
  const siteUrl = useSiteConfig().url.replace(/\/$/, '')
  const localePath = useLangPath()
  const route = useRoute()

  const parts = computed(() => splitLangPrefix(route.path))
  const pageLocale = computed(() => parts.value.code ?? DEFAULT_LOCALE)
  const url = (code: string) => siteUrl + withLangPrefix(code, parts.value.path)
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
    ogSiteName: () => t('meta.appName'),
    ogImage,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    twitterCard: 'summary_large_image',
    twitterImage: ogImage,
  })

  if (breadcrumb?.length) {
    useSchemaOrg([
      defineBreadcrumb({
        itemListElement: [
          { name: () => t('nav.generator'), item: localePath('/') },
          ...breadcrumb,
        ],
      }),
    ])
  }
}
