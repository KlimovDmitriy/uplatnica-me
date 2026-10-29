<script setup lang="ts">
/**
 * The only page. "/" is the blank generator; "/<template>" is the same page with a ready-made
 * order (own title, description and prerendered slip for search engines).
 */
import { findTemplate } from '~/data/templates'
import { FAQ } from '~/data/faq'
import { findInfoPage } from '~/data/pages'
import PrivacyPolicy from '~/components/PrivacyPolicy.vue'

// A fresh page per URL, so everything below is set up once for its slug. The language prefix is not
// part of the key: switching language keeps the page, and with it the slip being edited.
definePageMeta({ key: route => splitLangPrefix(route.path).path })

const route = useRoute()
const { t, locale } = useI18n()
const l = useLocalized()

const slug = String(route.params.slug ?? '')
const template = slug ? findTemplate(slug) : undefined
const info = slug ? findInfoPage(slug) : undefined
const INFO_COMPONENTS = { PrivacyPolicy }
if (slug && !template && !info) throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })

const active = ref(template?.payments[0]?.id ?? '')
const payment = computed(() => template?.payments.find(p => p.id === active.value))

usePageSeo({
  // The "| Uplatnica CG" suffix only while the title stays within ~60 characters, which is what
  // search results show.
  title: () => {
    if (!template) return info ? t(`${info.prefix}.metaTitle`) : t('meta.title')
    const plain = l(template.title)
    const full = t('templates.metaTitle', { title: plain })
    return full.length <= 60 ? full : plain
  },
  description: () => (template ? l(template.metaDescription) : info ? t(`${info.prefix}.metaDescription`) : t('meta.description')),
  breadcrumb: template ? [{ name: () => l(template.name) }] : info ? [{ name: () => t(`${info.prefix}.title`) }] : undefined,
})

// The app and its FAQ belong to the home page; template pages are plain pages with a breadcrumb.
useSchemaOrg(template || info
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
      <p
        v-if="template"
        class="back"
      >
        <LangLink to="/">
          ← {{ t('templates.blank') }}
        </LangLink>
      </p>
      <h1>{{ template ? l(template.title) : info ? t(`${info.prefix}.title`) : t('hero.title') }}</h1>
      <template v-if="!template && !info">
        <p class="lead">
          {{ t('hero.lead') }}
        </p>
        <p class="blank">
          <a href="#generator">{{ t('hero.blankLink') }}</a>
        </p>
      </template>
    </header>

    <component
      :is="INFO_COMPONENTS[info.component]"
      v-if="info"
      class="no-print"
    />

    <template v-else>
      <TemplatePicker
        v-if="!template"
        class="no-print"
      />

      <TemplateDetails
        v-if="template"
        v-model="active"
        class="no-print"
        :template="template"
      />

      <SlipGenerator
        id="generator"
        :preset="payment?.preset"
        :persist="!template"
      />

      <TemplateSources
        v-if="template"
        class="no-print"
        :template="template"
      />

      <AdSlot name="content" />

      <TemplatePicker
        v-if="template"
        class="no-print"
        :current="template.slug"
        more
      />

      <section
        v-if="!template"
        id="poziv-na-broj"
        class="card no-print tool"
        aria-labelledby="reference-title"
      >
        <h2 id="reference-title">
          {{ t('reference.title') }}
        </h2>
        <p class="lead">
          {{ t('reference.lead') }}
        </p>
        <ReferenceBuilder />
        <MunicipalityCodes />
      </section>

      <section
        id="provjera-racuna"
        class="card no-print tool"
        aria-labelledby="account-title"
      >
        <h2 id="account-title">
          {{ t('account.title') }}
        </h2>
        <AccountCheck />
      </section>

      <FaqSection
        v-if="!template"
        class="no-print"
      />
    </template>
  </div>
</template>

<style scoped>
.intro > :last-child { margin-bottom: 0; }
.intro .lead { margin: 0; }
.back { margin: 0 0 var(--s-2); font-size: var(--fs-sm); }
.blank { margin: var(--s-3) 0 0; }
.back a, .blank a { display: inline-flex; align-items: center; min-height: 24px; }
.tool { display: grid; gap: var(--s-3); }
.tool > * { margin: 0; min-width: 0; }
.tool .lead { font-size: var(--fs-md); }
</style>
