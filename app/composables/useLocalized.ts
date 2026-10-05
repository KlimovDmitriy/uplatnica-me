/** Text kept in data files rather than i18n JSON; `sr` is Montenegrin (the default locale code). */
export interface Localized {
  sr: string
  en: string
  ru: string
}

export function useLocalized() {
  const { locale } = useI18n()
  return (text: Localized): string => text[locale.value as keyof Localized] ?? text.sr
}
