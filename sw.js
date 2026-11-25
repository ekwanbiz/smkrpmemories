// SMKRP MEMORIES service worker
const CACHE = 'smkrp-v2';
const SHELL = ['./', './index.html', './logo.png', './icon-192.png', './icon-512.png', './manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'smkrp-model').map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // Model muka & library: simpan dalam telefon supaya buka seterusnya lebih laju
  if (u.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.open('smkrp-model').then(c => c.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }))));
    return;
  }
  // Fail app: cuba internet dulu (dapat versi terbaru), guna simpanan jika offline
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r)));
  }
});
