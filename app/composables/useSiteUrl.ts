/**
 * Public URL of the site including the base path, no trailing slash: "https://host/uplatnica" or
 * "https://uplatnica.rs". The configured site URL is the origin, but on the client @nuxtjs/i18n
 * puts its own base URL (origin + base path) into the site config, so the base is stripped first.
 */
export function useSiteUrl(): string {
  const base = useRuntimeConfig().app.baseURL
  return siteOrigin(useSiteConfig().url, base) + normalizeBase(base).slice(0, -1)
}
