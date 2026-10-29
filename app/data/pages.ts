/**
 * Plain text pages. Like tools and templates they are variants of the one page
 * (app/pages/[[slug]].vue): a slug, a component and i18n texts under `prefix`
 * (title, metaTitle, metaDescription). Linked from the footer, so they are crawled and
 * end up in the sitemap.
 */
export interface InfoPage {
  slug: string
  /** Component in app/components. */
  component: 'PrivacyPolicy'
  prefix: 'privacy'
  /** i18n key (under `nav`) of the footer link. */
  nav: 'privacy'
}

export const INFO_PAGES: InfoPage[] = [
  { slug: 'privatnost', component: 'PrivacyPolicy', prefix: 'privacy', nav: 'privacy' },
]

export const findInfoPage = (slug: string) => INFO_PAGES.find(p => p.slug === slug)
