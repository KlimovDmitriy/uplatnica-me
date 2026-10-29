<script setup lang="ts">
/** Privacy policy. Each section describes only what this build actually uses (analytics, ads, donations, contact). */
import { adsenseClient, type AdsEnv } from '~/utils/ads'

const { t } = useI18n()
const config = useRuntimeConfig().public
const donate = useDonate()
const analytics = !!config.plausibleDomain
const ads = !!adsenseClient(config as AdsEnv)
const email = String(config.contactEmail ?? '').trim()
</script>

<template>
  <article class="prose card">
    <h2>{{ t('privacy.dataTitle') }}</h2>
    <p>{{ t('privacy.data') }}</p>

    <template v-if="analytics">
      <h2>{{ t('privacy.analyticsTitle') }}</h2>
      <p>{{ t('privacy.analytics') }}</p>
    </template>

    <template v-if="ads">
      <h2>{{ t('privacy.adsTitle') }}</h2>
      <p>
        {{ t('privacy.ads') }}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener"
        >{{ t('privacy.adsLink') }}</a>
      </p>
    </template>

    <template v-if="donate.enabled">
      <h2>{{ t('privacy.donateTitle') }}</h2>
      <p>{{ t('privacy.donate') }}</p>
    </template>

    <template v-if="email">
      <h2>{{ t('privacy.contactTitle') }}</h2>
      <p>
        {{ t('privacy.contact') }}
        <a :href="`mailto:${email}`">{{ email }}</a>
      </p>
    </template>
  </article>
</template>
