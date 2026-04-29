// ============================================================
// SERVICE WORKER — JajaBus PWA
// File: sw.js
// Letakkan di root folder: /jajabus/sw.js
// ============================================================

var CACHE_NAME    = 'jajabus-v1';
var APP_URL       = 'https://azmimasterku99999-collab.github.io/jajabus/';

// File yang di-cache saat install (App Shell)
var PRECACHE = [
  '/jajabus/',
  '/jajabus/index.html',
  '/jajabus/manifest.json',
  '/jajabus/icons/icon-192.png',
  '/jajabus/icons/icon-512.png'
];

// ── INSTALL: cache app shell ─────────────────────────────
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: hapus cache lama ───────────────────────────
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── FETCH: strategi Network First untuk data, Cache First untuk aset ──
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Google Apps Script (data API) — selalu Network, jangan di-cache
  if (url.hostname === 'script.google.com' || url.hostname === 'script.googleusercontent.com') {
    e.respondWith(fetch(e.request));
    return;
  }

  // Aset lokal (icons, manifest, html) — Cache First dengan Network fallback
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache response baru untuk permintaan GET yang sukses
        if (e.request.method === 'GET' && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback: tampilkan halaman utama dari cache
        return caches.match('/jajabus/') || caches.match('/jajabus/index.html');
      });
    })
  );
});
