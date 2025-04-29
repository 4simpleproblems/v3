// sw.js
const CACHE_NAME    = 'advanced-proxy-v1';
const OFFLINE_URL   = '/offline.html';
const TARGET_ORIGIN = 'https://4sp.koyeb.app';

// Install: cache offline page & claim immediately
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())  // :contentReference[oaicite:8]{index=8}
  );
});

// Activate: claim clients immediately
self.addEventListener('activate', evt => {
  evt.waitUntil(clients.claim());     // :contentReference[oaicite:9]{index=9}
});

// Listen for clear-cache messages
self.addEventListener('message', evt => {
  if (evt.data.action === 'clear-cache') {
    caches.delete(CACHE_NAME).then(() => evt.ports[0]?.postMessage({ cleared: true }));
  }
});

// Background sync for queued requests
self.addEventListener('sync', evt => {
  if (evt.tag === 'offline-queue') {
    evt.waitUntil(processQueue());     // :contentReference[oaicite:10]{index=10}
  }
});

// Periodic background sync to refresh cache
self.addEventListener('periodicsync', evt => {
  if (evt.tag === 'refresh-cache') {
    evt.waitUntil(refreshAll());       // :contentReference[oaicite:11]{index=11}
  }
});

// Push notifications for updates
self.addEventListener('push', evt => {
  const data = evt.data?.json() || { title: 'Update Available', body: 'New content is ready.' };
  self.registration.showNotification(data.title, { body: data.body }); // :contentReference[oaicite:12]{index=12}
});

// Core fetch handler: reverse proxy, caching, content rewrite
self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);
  if (url.origin !== location.origin) return;

  const target = TARGET_ORIGIN + url.pathname + url.search;
  evt.respondWith((async () => {
    try {
      const response = await fetch(target, { mode: 'cors' });
      if (!response.ok) throw new Error('Network error');
      const ct = response.headers.get('Content-Type') || '';
      if (ct.includes('text/html')) {
        // Rewrite HTML links
        const text = await response.text();
        const parser = new DOMParser();                                 // :contentReference[oaicite:13]{index=13}
        const doc = parser.parseFromString(text, 'text/html');
        for (const el of doc.querySelectorAll('[src],[href]')) {
          const attr = el.hasAttribute('href') ? 'href' : 'src';
          const val = el.getAttribute(attr);
          if (val.startsWith('/')) el.setAttribute(attr, TARGET_ORIGIN + val);
        }
        const fixed = new Response('<!doctype html>' + doc.documentElement.outerHTML, {
          headers: response.headers
        });
        return fixed;
      }
      // Static assets: stale-while-revalidate
      const cache = await caches.open(CACHE_NAME);
      cache.put(evt.request, response.clone());                         // :contentReference[oaicite:14]{index=14}
      return response;
    } catch (err) {
      // On failure, try cache first
      const cacheRes = await caches.match(evt.request);
      if (cacheRes) return cacheRes;
      // Fallback to offline page for navigations
      if (evt.request.mode === 'navigate') {
        return caches.match(OFFLINE_URL);
      }
      return new Response('', { status: 504, statusText: 'Gateway Timeout' });
    }
  })());
});

// Process queued requests when back online
async function processQueue() {
  const queue = await getQueue(); // your logic to retrieve stored requests
  for (const req of queue) {
    await fetch(req);
  }
}

// Periodic cache refresh
async function refreshAll() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  await Promise.all(keys.map(req => fetch(req.url).then(r => cache.put(req, r))));
}

// (Optional) Register periodic sync and push subscription
self.registration.periodicSync.register('refresh-cache', {
  minInterval: 24 * 60 * 60 * 1000
});
self.registration.pushManager.subscribe({ userVisibleOnly: true });
