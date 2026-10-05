/**
 * Every page exists once per language for search engines: "/x" (Montenegrin, default)
 * plus "/en/x" and "/ru/x". Visitors never see the prefix: the client strips it
 * from the address bar and keeps the language in localStorage.
 */
export const DEFAULT_LOCALE = 'sr'
export const PREFIXED_LOCALES = ['en', 'ru'] as const

export type LocaleCode = typeof DEFAULT_LOCALE | typeof PREFIXED_LOCALES[number]

/** "/ru/pdv" → { code: "ru", path: "/pdv" }; "/pdv" → { code: null, path: "/pdv" }. */
export function splitLangPrefix(path: string): { code: LocaleCode | null, path: string } {
  for (const code of PREFIXED_LOCALES) {
    if (path === `/${code}` || path.startsWith(`/${code}/`)) {
      return { code, path: path.slice(code.length + 1) || '/' }
    }
  }
  return { code: null, path }
}

export function withLangPrefix(code: string | null, path: string): string {
  if (!code || code === DEFAULT_LOCALE) return path
  return path === '/' ? `/${code}` : `/${code}${path}`
}
