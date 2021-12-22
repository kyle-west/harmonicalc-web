// modified from https://github.com/jamesjohnson280/hello-pwa/blob/master/sw.js

const cacheName = 'harmonicalc-v0.1.0';
const filesToCache = [
  // './',
  // './index.html',
  // './reset.css',
  // './styles.css',
  // './view.js'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});