/**
 * The enabled "support the author" methods for the current language, reactive to it. Details come
 * from NUXT_PUBLIC_DONATE_* env vars at build time (nuxt.config.ts); see resolveDonate. The
 * language is the same on the server and on the client at hydration (set from the route prefix), so
 * prerendered pages match; switching language afterwards updates the donate UI.
 */
export function useDonate() {
  const cfg = useRuntimeConfig().public.donate
  const { locale } = useI18n()
  return computed(() => resolveDonate(cfg, locale.value))
}
