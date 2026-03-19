// sw.js — FotoVault Service Worker
const CACHE = 'fotovault-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Per le richieste Google API non usare cache
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('google.com')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('/index.html')))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'FotoVault', body: 'Nuova notifica' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'FotoVault', {
      body: data.body || 'Nuova attività',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
    })
  );
});
