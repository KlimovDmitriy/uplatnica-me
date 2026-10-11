import type { NuxtPage } from 'nuxt/schema'
import { PREFIXED_LOCALES } from './shared/utils/lang'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://uplatnica.example.me'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n', '@nuxtjs/sitemap', '@nuxtjs/robots', 'nuxt-schema-org'],

  css: ['~/assets/css/main.css'],

  hooks: {
    // "/ru/x", "/en/x": the same pages rendered in another language, so search
    // engines index every language. plugins/locale-route.ts sets the language from the prefix.
    'pages:extend'(pages) {
      const copies: NuxtPage[] = []
      for (const code of PREFIXED_LOCALES) {
        for (const page of pages) {
          copies.push({
            ...page,
            name: page.name && `lang-${code}-${page.name}`,
            path: page.path === '/' ? `/${code}` : `/${code}${page.path}`,
          })
        }
      }
      pages.push(...copies)
    },
  },

  // Baked in at `nuxt generate` from NUXT_PUBLIC_* env vars (see .env.example).
  runtimeConfig: {
    public: {
      googleSiteVerification: '',
      yandexVerification: '',
      plausibleDomain: '',
      plausibleSrc: 'https://plausible.io/js/script.js',
    },
  },

  site: {
    url: siteUrl,
    name: 'Uplatnica CG',
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [{ name: 'theme-color', content: '#ffffff' }],
    },
  },

  i18n: {
    baseUrl: siteUrl,
    defaultLocale: 'sr',
    // Routing is ours (see hooks above and shared/utils/lang.ts): visitors never see a
    // language prefix, the chosen language lives in localStorage.
    strategy: 'no_prefix',
    // "sr" is only the internal code of the default language: Montenegrin in Latin script.
    locales: [
      { code: 'sr', language: 'sr-Latn-ME', name: 'Crnogorski', file: 'sr.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
    ],
    detectBrowserLanguage: false,
  },

  // Fully static: every page in every language is prerendered. The crawler starts from each
  // language's home page and follows its in-language links.
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', ...PREFIXED_LOCALES.map(code => `/${code}`)],
    },
  },
})
