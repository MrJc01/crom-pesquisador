const CACHE_NAME = 'crom-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch for now, just to satisfy PWA installability requirements
  event.respondWith(fetch(event.request));
});
