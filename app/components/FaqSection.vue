<script setup lang="ts">
import { FAQ } from '~/data/faq'

const { t } = useI18n()
</script>

<template>
  <section class="faq">
    <h2>{{ t('faq.title') }}</h2>
    <template
      v-for="k in FAQ"
      :key="k"
    >
      <h3>{{ t(`faq.${k}.q`) }}</h3>
      <p>{{ t(`faq.${k}.a`) }}</p>
    </template>
  </section>
</template>
