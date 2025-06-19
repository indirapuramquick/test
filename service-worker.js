
const CACHE_NAME = 'iqb-pos-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Assuming your bundler outputs this or similar
  // Add paths to your main CSS and JS bundles if they are static and named predictably
  // '/static/css/main.chunk.css', 
  // '/static/js/main.chunk.js',
  // '/static/js/bundle.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/outline/heroicons.min.css'
  // Note: Dynamically imported ESM modules from esm.sh might be harder to cache reliably here
  // and might be better left to browser cache or more advanced service worker strategies.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all URLs to cache, but don't fail install if some external resources (CDN) fail
        const cachePromises = urlsToCache.map(urlToCache => {
          return cache.add(urlToCache).catch(err => {
            console.warn(`Failed to cache ${urlToCache}: ${err}`);
          });
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // We don't want to cache failed requests from CDNs or other external resources
                // if they are critical for the app, but for non-critical assets this is fine.
                // For this basic setup, we cache what we fetch successfully.
                 if (event.request.method === 'GET') { // Only cache GET requests
                    cache.put(event.request, responseToCache);
                 }
              });

            return response;
          }
        ).catch(error => {
            // Network request failed, try to serve a fallback or just let it fail
            // For a POS app, core functionality relies on JS and local storage,
            // so if core app files aren't cached, this won't help much.
            console.error('Fetch failed; returning offline page instead.', error);
            // Example: return caches.match('/offline.html');
            // For now, just let it fail to indicate network issue.
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Optional: Add skipWaiting to activate the new service worker faster
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
