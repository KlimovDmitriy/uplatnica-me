let loading: Promise<void> | undefined

/** Loads the adsbygoogle script once (the first slot near the viewport asks for it). */
export function loadAdsense(client: string): Promise<void> {
  loading ??= new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.async = true
    el.crossOrigin = 'anonymous'
    el.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`
    el.onload = () => resolve()
    el.onerror = () => reject(new Error('adsbygoogle failed to load'))
    document.head.append(el)
  })
  return loading
}
