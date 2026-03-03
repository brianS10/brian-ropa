/**
 * Service Worker para PWA - Mejorado
 * ====================================
 * Estrategias de cache:
 * - Static assets: Cache First (CSS, JS, imágenes locales)
 * - API/Supabase: Network First, cache fallback (productos, etc.)
 * - Imágenes de productos: Stale While Revalidate
 * - Navegación: Network First, offline fallback
 */

const CACHE_VERSION = 'v2'
const CACHE_STATIC = `tienda-static-${CACHE_VERSION}`
const CACHE_DYNAMIC = `tienda-dynamic-${CACHE_VERSION}`
const CACHE_IMAGES = `tienda-images-${CACHE_VERSION}`

// Archivos estáticos para cachear inmediatamente
const STATIC_ASSETS = [
  '/',
  '/catalogo',
  '/offline',
  '/manifest.json',
  '/logo.png'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => { })
  )
  // Activar inmediatamente
  self.skipWaiting()
})

// Activación - limpiar caches viejos
self.addEventListener('activate', (event) => {
  const cachesValidos = [CACHE_STATIC, CACHE_DYNAMIC, CACHE_IMAGES]

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cachesValidos.includes(cacheName)) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Tomar control de todas las páginas
  self.clients.claim()
})

// Determinar estrategia según la URL
function getStrategy(url) {
  const urlObj = new URL(url)

  // Imágenes de Supabase Storage → Stale While Revalidate
  if (url.includes('supabase') && url.includes('storage')) {
    return 'stale-while-revalidate'
  }

  // API de Supabase (datos) → Network First
  if (url.includes('supabase') && url.includes('rest')) {
    return 'network-first'
  }

  // Imágenes locales → Cache First
  if (url.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/)) {
    return 'cache-first'
  }

  // Assets estáticos → Cache First
  if (url.match(/\.(css|js|woff2?)$/) || url.includes('_next/static')) {
    return 'cache-first'
  }

  // Navegación (páginas HTML) → Network First
  return 'network-first'
}

// Estrategia: Cache First
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_STATIC)
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    return new Response('Offline', { status: 503 })
  }
}

// Estrategia: Network First
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_DYNAMIC)
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    const cached = await caches.match(request)
    if (cached) return cached

    // Si es navegación, mostrar página offline
    if (request.mode === 'navigate') {
      return caches.match('/offline')
    }

    // Para APIs, devolver JSON vacío cacheado
    if (request.url.includes('supabase') && request.url.includes('rest')) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Offline', { status: 503 })
  }
}

// Estrategia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response && response.status === 200) {
        const cache = await caches.open(CACHE_IMAGES)
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => null)

  // Devolver cache inmediatamente, actualizar en segundo plano
  return cached || await networkPromise || new Response('', { status: 404 })
}

// Interceptar requests
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') return

  // Ignorar requests que no son HTTP
  if (!event.request.url.startsWith('http')) return

  // Ignorar chrome-extension y otros
  if (event.request.url.includes('chrome-extension')) return

  const strategy = getStrategy(event.request.url)

  switch (strategy) {
    case 'cache-first':
      event.respondWith(cacheFirst(event.request))
      break
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(event.request))
      break
    case 'network-first':
    default:
      event.respondWith(networkFirst(event.request))
      break
  }
})

// Background sync - para guardar pedidos offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pedidos') {
    event.waitUntil(syncPendingOrders())
  }
})

async function syncPendingOrders() {
  // TODO: Implementar sync de pedidos pendientes
  console.log('Sincronizando pedidos pendientes...')
}
