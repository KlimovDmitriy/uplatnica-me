/**
 * Internal link targets in the language of the current route: on "/ru/…" pages links point
 * to "/ru/…", so crawlers stay within one language. Visitors never see the prefix.
 */
export function useLangPath() {
  const route = useRoute()
  return (path: string) => withLangPrefix(splitLangPrefix(route.path).code, path)
}
