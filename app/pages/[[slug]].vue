<script setup lang="ts">
/**
 * The only page. "/" is the blank generator; "/<template>" is the same page with a ready-made
 * order (own title, description and prerendered slip for search engines).
 */
import { findTemplate } from '~/data/templates'
import { FAQ } from '~/data/faq'

// A fresh page per URL, so everything below is set up once for its slug. The language prefix is not
// part of the key: switching language keeps the page, and with it the slip being edited.
definePageMeta({ key: route => splitLangPrefix(route.path).path })

const route = useRoute()
const { t, locale } = useI18n()
const l = useLocalized()

const slug = String(route.params.slug ?? '')
const template = slug ? findTemplate(slug) : undefined
if (slug && !template) throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })

const active = ref(template?.payments[0]?.id ?? '')
const payment = computed(() => template?.payments.find(p => p.id === active.value))

usePageSeo({
  title: () => (template ? t('templates.metaTitle', { title: l(template.title) }) : t('meta.title')),
  description: () => (template ? l(template.metaDescription) : t('meta.description')),
  breadcrumb: template && [{ name: () => l(template.name) }],
})

// The app and its FAQ belong to the home page; template pages are plain pages with a breadcrumb.
useSchemaOrg(template
  ? [defineWebPage()]
  : [
      defineWebPage({ '@type': ['WebPage', 'FAQPage'] }),
      defineSoftwareApp({
        name: () => t('meta.appName'),
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        inLanguage: () => locale.value,
        offers: { price: 0, priceCurrency: 'EUR' },
      }),
      ...FAQ.map(k => defineQuestion({
        name: () => t(`faq.${k}.q`),
        acceptedAnswer: () => t(`faq.${k}.a`),
      })),
    ])
</script>

<template>
  <div class="container page">
    <header class="no-print intro">
      <h1>{{ template ? l(template.title) : t('hero.title') }}</h1>
      <p v-if="!template">
        {{ t('hero.lead') }}
      </p>
    </header>

    <TemplatePicker
      class="no-print"
      :current="template?.slug"
    />

    <TemplateDetails
      v-if="template"
      v-model="active"
      class="no-print"
      :template="template"
    />

    <SlipGenerator
      :preset="payment?.preset"
      :persist="!template"
    />

    <TemplateSources
      v-if="template"
      class="no-print"
      :template="template"
    />

    <section class="no-print tools">
      <template v-if="!template">
        <h2 id="poziv-na-broj">
          {{ t('reference.title') }}
        </h2>
        <p class="muted">
          {{ t('reference.lead') }}
        </p>
        <ReferenceBuilder />
        <MunicipalityCodes />
      </template>

      <h2 id="provjera-racuna">
        {{ t('account.title') }}
      </h2>
      <AccountCheck />
    </section>

    <FaqSection
      v-if="!template"
      class="no-print"
    />
  </div>
</template>

<style scoped>
.page { display: grid; gap: 16px; }
.intro { padding-top: 16px; }
.intro h1 { margin-bottom: 4px; }
.intro p { color: #444; margin: 0; }
.tools { display: grid; gap: 10px; margin-top: 12px; }
.tools h2 { margin: 16px 0 0; font-size: 17px; }
.muted { color: #555; margin: 0; font-size: 14px; }
</style>
