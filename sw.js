// sw.js
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // only intercept under /proxy/
  if (url.pathname.startsWith('/proxy/')) {
    const target = url.toString().replace(
      /^https?:\/\/[^\/]+\/proxy\//,
      'https://4sp.koyeb.app/'
    );
    e.respondWith(fetch(target));
  }
});
