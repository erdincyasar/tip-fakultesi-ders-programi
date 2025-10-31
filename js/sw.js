// Version: 6
// Updated: 2025-10-31T20:08:01Z

// Service Worker for PWA functionality
const CACHE_NAME = 'ders-programi-v2.0.0';
const urlsToCache = [
  'https://www.uludag.edu.tr/dosyalar/tip/asama1/',
  'https://www.uludag.edu.tr/dosyalar/tip/asama1/Index.html',
  'https://www.uludag.edu.tr/dosyalar/tip/asama1/manifest.json',
  // Bootstrap CSS
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  // Bootstrap JS
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  // FullCalendar
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js',
  // Bootstrap Icons
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
  // Modular JS Files
  'https://www.uludag.edu.tr/dosyalar/tip/asama1/js/sw.js',

  'https://www.uludag.edu.tr/dosyalar/tip/asama1/js/config.js',
  'https://www.uludag.edu.tr/dosyalar/tip/asama1/js/utils.js',
  'https://www.uludag.edu.tr/dosyalar/tip/asama1/js/calendar.js',
  'https://www.uludag.edu.tr/dosyalar/tip/asama1/js/modal.js',
  'https://www.uludag.edu.tr/dosyalar/tip/asama1/js/search.js',
  'https://www.uludag.edu.tr/dosyalar/tip/asama1/js/pwa.js',
  'https://www.uludag.edu.tr/dosyalar/tip/asama1/js/app.js'
];

// Runtime cache for dynamic content
const RUNTIME_CACHE = 'ders-programi-runtime-v1.0.0';

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.includes('cdn.jsdelivr.net') &&
      !event.request.url.includes('fonts.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Use appropriate cache based on content type
          const cacheName = event.request.url.includes('googleusercontent.com') ||
                           event.request.url.includes('script.google.com')
                           ? RUNTIME_CACHE : CACHE_NAME;

          caches.open(cacheName)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          console.log('Fetch failed:', error);
          // If fetch fails (offline), try to serve a fallback
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
          // For images, serve a placeholder
          if (event.request.destination === 'image') {
            return new Response('', { status: 404 });
          }
        });
      })
  );
});

// Background sync for notifications (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered');
}

// Push notifications (if supported)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});