const CACHE_NAME = 'vowplan-v4';
const ASSETS = [
  './',
  './../vowANDplan.html',
  './fonts.css',
  './html2canvas.min.js',
  './jspdf.umd.min.js',
  './jspdf-autotable.min.js',
  './xlsx.full.min.js',
  './chart.js',
  './index-D62M_-xp.css',
  './icon-192.png',
  './icon-512.png',
  './sw.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        return response;
      }).catch(() => {
        return new Response('Offline - Resource not cached', { status: 503 });
      });
    })
  );
});
