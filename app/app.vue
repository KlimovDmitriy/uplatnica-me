<script setup lang="ts">
// Keeps <html lang> in sync with the language chosen on the client.
const head = useLocaleHead({ seo: false })
const config = useRuntimeConfig().public

useHead({
  htmlAttrs: { lang: () => head.value.htmlAttrs?.lang },
  link: () => [
    ...(head.value.link ?? []),
    { rel: 'manifest', href: '/manifest.webmanifest' },
    { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
  ],
  meta: () => [
    ...(head.value.meta ?? []),
    ...(config.googleSiteVerification ? [{ name: 'google-site-verification', content: config.googleSiteVerification }] : []),
    ...(config.yandexVerification ? [{ name: 'yandex-verification', content: config.yandexVerification }] : []),
  ],
  script: config.plausibleDomain
    ? [{ 'src': config.plausibleSrc, 'defer': true, 'data-domain': config.plausibleDomain }]
    : [],
})

onMounted(() => {
  if ('serviceWorker' in navigator && !import.meta.dev) navigator.serviceWorker.register('/sw.js').catch(() => {})
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
