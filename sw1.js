const CACHE_NAME = "app_version1";
const allUrls = ["/", "/index.html", "/static/js/main.chunk.js", "/static/js/0.chunk.js", "/static/js/bundle.js"];

this.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(allUrls)));
});

// Activate the SW
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [];
  cacheWhitelist.push(CACHE_NAME);

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

this.addEventListener("fetch", (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match(event.request).then((req) => {
        if (req) return req;
        let requestUrl = event.request.clone();
        return fetch(requestUrl);
      })
    );
  }
});
