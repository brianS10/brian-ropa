/**
 * Service Worker para PWA
 * Permite que la app funcione offline y sea instalable
 */

const CACHE_NAME = 'tienda-v1'
const urlsToCache = [
  '/',
  '/catalogo',
  '/offline'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto')
        return cache.addAll(urlsToCache)
      })
      .catch((err) => {
        console.log('Error al cachear:', err)
      })
  )
  // Activar inmediatamente
  self.skipWaiting()
})

// Activación - limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando cache viejo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Tomar control de todas las páginas
  self.clients.claim()
})

// Estrategia: Network First, fallback to cache
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') return

  // Ignorar requests de extensiones o chrome
  if (!event.request.url.startsWith('http')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardar en cache
        if (response && response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            // No cachear APIs de Supabase
            if (!event.request.url.includes('supabase')) {
              cache.put(event.request, responseClone)
            }
          })
        }
        return response
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response
          }
          // Si es una navegación, mostrar página offline
          if (event.request.mode === 'navigate') {
            return caches.match('/offline')
          }
        })
      })
  )
})
