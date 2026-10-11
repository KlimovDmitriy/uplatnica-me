// Offline support.
// - Pages (navigations): network first, revalidated against the server every time (never the
//   HTTP cache), the last good copy only when offline. HTML is never served from cache while online.
// - Hashed build assets (/_nuxt/*) and icons: cache first, they never change under the same URL.
// - Everything else (manifest, favicon, og images): network first.
// Bump VERSION when this file's strategy changes or to drop cached assets; old caches are deleted on activate.
const VERSION = 'v2'
const PAGES = `uplatnica-me-pages-${VERSION}`
const ASSETS = `uplatnica-me-assets-${VERSION}`

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== PAGES && key !== ASSETS) await caches.delete(key)
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') event.respondWith(page(request))
  else if (url.pathname.startsWith('/_nuxt/') || url.pathname.startsWith('/icons/')) event.respondWith(cacheFirst(request))
  else event.respondWith(networkFirst(request))
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) (await caches.open(ASSETS)).put(request, response.clone())
  return response
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) (await caches.open(PAGES)).put(request, response.clone())
    return response
  }
  catch {
    return (await caches.match(request)) || Response.error()
  }
}

async function page(request) {
  try {
    const response = await fetch(request, { cache: 'no-cache' })
    if (response.ok) (await caches.open(PAGES)).put(request, response.clone())
    return response
  }
  catch {
    // Offline: this page if it was visited, otherwise the home page.
    return (await caches.match(request)) || (await caches.match('/')) || Response.error()
  }
}
