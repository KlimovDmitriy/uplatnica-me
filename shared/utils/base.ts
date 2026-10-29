/**
 * The site may live under a sub-path (GitHub Pages: "/uplatnica/") or at the root of a domain.
 * NUXT_APP_BASE_URL sets it, the default is "/". These helpers keep every URL we build by hand
 * (head links, service worker, address bar) consistent with it.
 */

/** "" / "uplatnica" / "/uplatnica" → "/" or "/uplatnica/" (leading and trailing slash). */
export function normalizeBase(base?: string | null): string {
  const trimmed = (base ?? '').trim().replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}/` : '/'
}

/** "/uplatnica/ru/x" with base "/uplatnica/" → "/ru/x" (the path the router sees). */
export function stripBase(pathname: string, base: string): string {
  const b = normalizeBase(base)
  if (b === '/') return pathname
  if (pathname === b.slice(0, -1)) return '/'
  return pathname.startsWith(b) ? pathname.slice(b.length - 1) : pathname
}

/** "/ru/x" with base "/uplatnica/" → "/uplatnica/ru/x". */
export function withBase(base: string, path: string): string {
  const b = normalizeBase(base)
  return b === '/' ? path : b.slice(0, -1) + (path.startsWith('/') ? path : `/${path}`)
}

/**
 * "https://host/uplatnica" with base "/uplatnica/" → "https://host". The sitemap and schema.org modules
 * append the base path to the site URL themselves, so they must be given the origin only.
 */
export function siteOrigin(siteUrl: string, base: string): string {
  const url = siteUrl.replace(/\/+$/, '')
  const path = normalizeBase(base).slice(0, -1)
  return path && url.endsWith(path) ? url.slice(0, -path.length) : url
}

/** "/en/pdv" → "/en/pdv/"; a query or hash is not expected here. */
export function ensureTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`
}
