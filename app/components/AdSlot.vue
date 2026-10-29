<script setup lang="ts">
/**
 * One ad slot (Google AdSense). Renders nothing, not even an empty box, unless
 * NUXT_PUBLIC_ADS_PROVIDER=adsense with a client and slot id (see .env.example); the same in every
 * language. The space is reserved with min-height so a late ad doesn't shift the page. The
 * adsbygoogle script is never in the HTML: the first slot that nears the viewport loads it, once,
 * in the browser (not for crawlers); a failed or unfilled slot collapses.
 */
import { loadAdsense } from '~/utils/adsenseScript'
import { resolveAdSlot, type AdSlotName, type AdsEnv } from '~/utils/ads'

const props = defineProps<{ name: AdSlotName }>()
const { t } = useI18n()
const ad = resolveAdSlot(useRuntimeConfig().public as AdsEnv, props.name)

const BOT = /bot|crawl|spider|slurp|google|yandex|bing|baidu|duckduck|facebookexternalhit|lighthouse|headless/i
const root = ref<HTMLElement>()
const ins = ref<HTMLElement>()
const collapsed = ref(false)
let cleanup: (() => void) | undefined
onBeforeUnmount(() => cleanup?.())

onMounted(() => {
  if (!ad || !root.value || BOT.test(navigator.userAgent)) return
  let pushed = false
  const show = async () => {
    if (pushed) return
    pushed = true
    try {
      await loadAdsense(ad.client)
      const w = window as unknown as { adsbygoogle?: unknown[] }
      ;(w.adsbygoogle ??= []).push({})
    }
    catch {
      collapsed.value = true
    }
  }
  // AdSense marks an empty slot with data-ad-status="unfilled".
  const status = ins.value && new MutationObserver(() => {
    if (ins.value?.dataset.adStatus === 'unfilled') collapsed.value = true
  })
  if (ins.value) status?.observe(ins.value, { attributes: true, attributeFilter: ['data-ad-status'] })
  cleanup = () => status?.disconnect()
  if (!('IntersectionObserver' in window)) {
    show()
    return
  }
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      io.disconnect()
      show()
    }
  }, { rootMargin: '200px' })
  io.observe(root.value)
  cleanup = () => {
    io.disconnect()
    status?.disconnect()
  }
})
</script>

<template>
  <aside
    v-if="ad && !collapsed"
    ref="root"
    class="ad-slot no-print"
    :class="name"
    :aria-label="t('ads.label')"
  >
    <span class="label">{{ t('ads.label') }}</span>
    <ins
      ref="ins"
      class="adsbygoogle"
      :data-ad-client="ad.client"
      :data-ad-slot="ad.slot"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  </aside>
</template>

<style scoped>
.ad-slot { display: grid; align-content: start; gap: var(--s-1); overflow: hidden; min-height: var(--ad-h); }
.after-slip { --ad-h: 100px; }
.content { --ad-h: 250px; }
@media (min-width: 960px) {
  .after-slip { --ad-h: 90px; }
  .content { --ad-h: 120px; }
}
.label { font-size: var(--fs-xs); color: var(--text-muted); }
.adsbygoogle { display: block; }
</style>
