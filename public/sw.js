const CACHE = 'tb-shell-v1';
const SHELL = [
  '/dashboard',
  '/manifest.webmanifest',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Network-only for API calls
  if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/functions/')) return;
  // Cache-first for shell
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
