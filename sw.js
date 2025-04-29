// sw.js
const CACHE_NAME    = 'sw-proxy-v2';
const OFFLINE_URL   = '/offline.html';
const TARGET_ORIGIN = 'https://4sp.koyeb.app';

self.addEventListener('install', event => {
  // Pre-cache the offline fallback page
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting())  // Activate worker immediately :contentReference[oaicite:6]{index=6}
  );
});

self.addEventListener('activate', event => {
  // Take control of all pages under scope without reload :contentReference[oaicite:7]{index=7}
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests to our own origin
  if (url.origin !== location.origin) return;

  // Build the proxied URL
  const targetUrl = TARGET_ORIGIN + url.pathname + url.search;

  if (request.mode === 'navigate') {
    // Network-first for page loads :contentReference[oaicite:8]{index=8}
    event.respondWith(networkFirst(request, targetUrl));
  } else {
    // Cache-first for static assets :contentReference[oaicite:9]{index=9}
    event.respondWith(cacheFirst(request, targetUrl));
  }
});

async function networkFirst(req, targetUrl) {
  try {
    console.log('NW fetch:', targetUrl);
    const res = await fetch(targetUrl, { mode: 'cors' });  // CORS fetch :contentReference[oaicite:10]{index=10}
    if (!res.ok) throw new Error(`Status ${res.status}`);

    // If HTML, rewrite links so they continue pointing to TARGET_ORIGIN
    if (res.headers.get('Content-Type')?.includes('text/html')) {
      const text = await res.text();
      const fixed = text.replace(
        /(href|src)=["']\/([^"']+)/g,
        (_, attr, path) => `${attr}="${TARGET_ORIGIN}/${path}"`
      );  // Regex-based rewriting :contentReference[oaicite:11]{index=11}
      return new Response(fixed, { headers: res.headers });
    }

    return res;
  } catch (err) {
    console.error('Network-first failed:', err);  // Debug logging :contentReference[oaicite:12]{index=12}
    const cache = await caches.open(CACHE_NAME);
    return cache.match(OFFLINE_URL);
  }
}

async function cacheFirst(req, targetUrl) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) {
    console.log('Cache hit:', req.url);
    return cached;
  }
  try {
    console.log('Cache miss, fetching:', targetUrl);
    const res = await fetch(targetUrl, { mode: 'cors' });  // CORS fetch :contentReference[oaicite:13]{index=13}
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    console.error('Cache-first failed:', err);  // Debug logging :contentReference[oaicite:14]{index=14}
    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}
