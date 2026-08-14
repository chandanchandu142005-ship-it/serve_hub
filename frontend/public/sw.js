/* Servehub service worker — makes the app installable and work offline.
   Caches the app shell (HTML + manifest + icons) on install, then serves
   navigations network-first (fresh content when online, cached shell when
   offline) and static assets cache-first. The API lives on a different
   origin (localhost:4000) and is deliberately never cached.
   Note: bump VERSION whenever you ship a release so installed apps pick up
   the new shell even offline (online users always get fresh content via the
   network-first navigation path). */
'use strict';
const VERSION = 'servehub-shell-v1';
const SHELL = [
  './',
  './servehub',
  './servehub.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      // Tolerant pre-cache: one missing entry (e.g. a host without the
      // extensionless /servehub route) must not fail the whole install.
      .then(cache => Promise.all(SHELL.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave API / other origins alone

  // Navigations: try network first, fall back to the cached app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          // Only refresh the cached shell from genuine success responses so a
          // 404/error page can never poison the offline fallback.
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then(c => c.put('./servehub.html', copy));
          }
          return res;
        })
        .catch(() =>
          caches.match('./servehub.html').then(hit => hit || caches.match('./'))
        )
    );
    return;
  }

  // Static assets: cache-first, then network (and cache successful results).
  event.respondWith(
    caches.match(req).then(hit =>
      hit ||
      fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      })
    )
  );
});
