const staticCacheName = "site-static-v1";
const dynamicCacheName = "site-dynamic-v1";

// serve worker install
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll(["/css/whatever-v3.css", "/css/imgs/sprites-v6.png", "/css/fonts/whatever-v8.woff", "/js/all-min-v4.js"]);
    })
  );
});

// serve activate
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            cacheName === staticCacheName || cacheName === dynamicCacheName;
          })
          .map(function (cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.open(dynamicCacheName).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        return (
          response ||
          fetch(event.request).then(function (response) {
            cache.put(event.request, response.clone());
            return response;
          })
        );
      });
    })
  );
});

self.addEventListener("push", function (event) {
  if (event.data.text() == "new-email") {
    event.waitUntil(
      caches
        .open("mysite-dynamic")
        .then(function (cache) {
          return fetch("/inbox.json").then(function (response) {
            cache.put("/inbox.json", response.clone());
            return response.json();
          });
        })
        .then(function (emails) {
          registration.showNotification("New email", {
            body: "From " + emails[0].from.name,
            tag: "new-email",
          });
        })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  if (event.notification.tag == "new-email") {
    // Assume that all of the resources needed to render
    // /inbox/ have previously been cached, e.g. as part
    // of the install handler.
    new WindowClient("/inbox/");
  }
});
