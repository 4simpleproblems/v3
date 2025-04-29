// sw.js
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/proxy/")) {
    const proxied = "https://4sp.koyeb.app" + url.pathname.replace("/proxy", "");
    e.respondWith(fetch(proxied));
  }
});
