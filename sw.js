self.addEventListener('fetch', event => {
  const target = event.request.url.replace(self.origin, 'https://4sp.koyeb.app');
  event.respondWith(fetch(target));
});
