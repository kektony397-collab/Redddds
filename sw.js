
const CACHE_NAME = 'gps-speedometer-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to cache requests from our origin.
  // Let the browser handle external resources like CDNs with its standard HTTP caching.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // If we get a valid response, update the cache with the new version.
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });

          // Return the cached response immediately if it exists, 
          // and fall back to the network fetch promise.
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete any caches that are not in our whitelist.
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});