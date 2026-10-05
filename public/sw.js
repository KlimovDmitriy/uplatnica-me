// Offline support. Pages: network first, cached copy when offline.
// Hashed build assets (/_nuxt/*) and icons: cache first, they never change under the same URL.
const CACHE = 'uplatnica-me-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key)
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  const immutable = url.pathname.startsWith('/_nuxt/') || url.pathname.startsWith('/icons/')
  event.respondWith(immutable ? cacheFirst(request) : networkFirst(request))
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) (await caches.open(CACHE)).put(request, response.clone())
  return response
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) (await caches.open(CACHE)).put(request, response.clone())
    return response
  }
  catch {
    return (await caches.match(request)) || (await caches.match('/')) || Response.error()
  }
}
