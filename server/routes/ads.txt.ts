import { adsTxt, type AdsEnv } from '../../app/utils/ads'

// Prerendered at build time, and only when NUXT_PUBLIC_ADS_PROVIDER=adsense (see nuxt.config.ts).
export default defineEventHandler((event) => {
  const body = adsTxt(useRuntimeConfig(event).public as AdsEnv)
  if (!body) throw createError({ statusCode: 404 })
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return body
})
