const TARGET_ORIGIN = 'https://4sp.koyeb.app';
const CACHE_NAME = 'proxy3-cache-v1';
const OFFLINE_URL = '/fallback.html';

// Pre-cache the offline fallback
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting())  // Activate SW immediately
  );
});

// Clean up old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      clients.claim(),  // Control without reload
      caches.keys().then(keys =>
        Promise.all(keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        }))
      )
    ])
  );
});

// Intercept all fetch requests
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only proxy same-origin requests (to us)
  if (url.origin !== self.location.origin) return;

  // Build the target URL path
  const targetUrl = TARGET_ORIGIN + url.pathname + url.search;

  // Navigation requests: network-first strategy
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(targetUrl, { credentials: 'include' })
        .then(resp => {
          // If HTML, rewrite links for assets
          if (resp.ok && resp.headers.get('Content-Type').includes('text/html')) {
            return resp.text().then(html => {
              // Regex-based link rewriting
              const fixed = html.replace(/(href|src)=(["'])(\/[^"']*)/g,
                (_, attr, quote, path) => `${attr}=${quote}${TARGET_ORIGIN}${path}${quote}`);
              return new Response(fixed, {
                headers: resp.headers
              });
            });
          }
          return resp;
        })
        .catch(() => caches.match(OFFLINE_URL))  // Fallback if offline
    );
  } else {
    // Static assets: cache-first strategy
    event.respondWith(
      caches.match(req).then(cacheRes => {
        if (cacheRes) return cacheRes;
        return fetch(targetUrl, { credentials: 'include' })
          .then(networkRes => {
            // Optional: cache the asset
            if (networkRes.ok) {
              const copy = networkRes.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
            }
            return networkRes;
          })
          .catch(() => {
            // Asset fetch failed; could return a placeholder if desired
            return new Response('', { status: 504, statusText: 'Gateway Timeout' });
          });
      })
    );
  }
});
