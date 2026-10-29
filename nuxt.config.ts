import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { NuxtPage } from 'nuxt/schema'
import { PREFIXED_LOCALES } from './shared/utils/lang'
import { normalizeBase, siteOrigin } from './shared/utils/base'

// Sub-path hosting (GitHub Pages: /uplatnica-me/); the default is the root of a domain. NUXT_PUBLIC_SITE_URL
// then carries the same path (https://host/uplatnica-me).
const baseURL = normalizeBase(process.env.NUXT_APP_BASE_URL)
// The sitemap and schema.org modules append the base path themselves, so they get the origin only.
const siteUrl = siteOrigin(process.env.NUXT_PUBLIC_SITE_URL || 'https://uplatnica.example.me', baseURL)
// Staging: NUXT_PUBLIC_NOINDEX=1 adds <meta name="robots" content="noindex, nofollow"> on every page and "Disallow: /".
const noindex = ['1', 'true'].includes((process.env.NUXT_PUBLIC_NOINDEX ?? '').trim().toLowerCase())
const adsenseOn = process.env.NUXT_PUBLIC_ADS_PROVIDER === 'adsense'

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
    // jsPDF is big and needed only when the visitor downloads a PDF (imported on demand),
    // so don't let the browser preload or prefetch its chunk. It still loads on demand.
    'build:manifest'(manifest) {
      for (const [key, entry] of Object.entries(manifest)) {
        if (/jspdf/.test(key) || /jspdf/.test(entry.file ?? '')) {
          entry.prefetch = false
          entry.preload = false
        }
      }
    },
  },

  // A robots.txt is only read at the root of a host, so the module skips it under a sub-path. Staging
  // there still gets a Disallow: / copy (the meta tag is what counts until the site has its own domain).
  robots: {
    robotsTxt: baseURL === '/',
  },

  // Language alternates are written into every page's <head> by usePageSeo (the sitemap module's
  // i18n integration doesn't know our prefix routing).
  sitemap: {
    autoI18n: false,
  },

  // Baked in at `nuxt generate` from NUXT_PUBLIC_* env vars (see .env.example).
  runtimeConfig: {
    public: {
      googleSiteVerification: '',
      yandexVerification: '',
      plausibleDomain: '',
      plausibleSrc: 'https://plausible.io/js/script.js',
      // Ads (NUXT_PUBLIC_ADS_PROVIDER): empty = no ads at all, "adsense" = Google AdSense slots.
      adsProvider: '',
      adsenseClient: '',
      adsenseSlotAfterSlip: '',
      adsenseSlotContent: '',
      // Contact e-mail on the privacy page, shown only if set.
      contactEmail: '',
      // "Support the author" details (NUXT_PUBLIC_DONATE_*). Empty methods are hidden, with none
      // visible in a language the donate button disappears there.
      donate: {
        sepaIban: '',
        sepaBic: '',
        sepaName: '',
        sepaBank: '',
        kofi: '',
        githubSponsors: '',
        // NUXT_PUBLIC_DONATE_DONATEPAY / _DONATIONALERTS: one word each, so the keys stay lowercase
        // (an env name is matched against the camelCase key split at capitals). ru only.
        donatepay: '',
        donationalerts: '',
        cryptoTron: '',
        cryptoTon: '',
        cryptoSolana: '',
        cryptoEvm: '',
      },
    },
  },

  site: {
    url: siteUrl,
    name: 'Uplatnica CG',
    indexable: !noindex,
  },

  app: {
    baseURL,
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` }],
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
    hooks: {
      compiled(nitro) {
        if (!noindex || baseURL === '/') return
        mkdirSync(nitro.options.output.publicDir, { recursive: true })
        writeFileSync(join(nitro.options.output.publicDir, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
      },
    },
    prerender: {
      crawlLinks: true,
      // ads.txt exists only when AdSense is on (server/routes/ads.txt.ts answers 404 otherwise).
      routes: ['/', ...PREFIXED_LOCALES.map(code => `/${code}`), ...(adsenseOn ? ['/ads.txt'] : [])],
    },
  },
})
