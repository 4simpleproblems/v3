// sw.js
const CACHE    = 'proxy-v4';
const OFFLINE  = '/offline.html';
const REMOTE   = 'https://4sp.koyeb.app';

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE)
      .then(c => c.add(OFFLINE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(clients.claim());
});

// Reverse-proxy every same-origin request
self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);
  if (url.origin !== location.origin) return;

  // Never proxy the offline page itself
  if (url.pathname === OFFLINE) return;

  const target = REMOTE + url.pathname + url.search;
  evt.respondWith((async () => {
    try {
      const res = await fetch(target, { mode: 'cors' });
      if (res.ok) return res;
      throw new Error('Status ' + res.status);
    } catch (err) {
      // If page navigation, serve offline; else try cache
      if (evt.request.mode === 'navigate') {
        return caches.match(OFFLINE);
      }
      const cache = await caches.open(CACHE);
      const hit   = await cache.match(evt.request);
      return hit || new Response('', { status: 504 });
    }
  })());
});
