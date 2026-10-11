/** Language offered to a first-time visitor (set by plugins/locale-storage.client.ts), or null. */
export function useLangSuggestion() {
  return useState<string | null>('lang-suggestion', () => null)
}
