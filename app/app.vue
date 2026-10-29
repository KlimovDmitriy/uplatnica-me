<script setup lang="ts">
// Keeps <html lang> in sync with the language chosen on the client.
const head = useLocaleHead({ seo: false })
const config = useRuntimeConfig().public
const base = useRuntimeConfig().app.baseURL

useHead({
  htmlAttrs: { lang: () => head.value.htmlAttrs?.lang },
  link: () => [
    ...(head.value.link ?? []),
    { rel: 'manifest', href: `${base}manifest.webmanifest` },
    { rel: 'apple-touch-icon', href: `${base}icons/apple-touch-icon.png` },
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
  if ('serviceWorker' in navigator && !import.meta.dev) navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {})
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
