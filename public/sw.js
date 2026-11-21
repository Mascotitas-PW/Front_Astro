const V = 'v1', SHELL = `shell-${V}`, RT = `rt-${V}`, IMG = `img-${V}`;
const BASE = new URL(self.registration.scope).pathname;
const PRECACHE = ['', 'en/', 'offline.html', 'manifest.webmanifest', 'favicon.svg',
  'icons/mascotitas-192.png', 'icons/mascotitas-512.png'].map((p) => BASE + p);

self.addEventListener('install', (e) =>
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())));

self.addEventListener('activate', (e) =>
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => ![SHELL, RT, IMG].includes(k)).map((k) => caches.delete(k))))
    .then(() => self.clients.claim())));

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;            // GraphQL y pagos (POST) siempre van a la red
  const u = new URL(r.url);
  if (r.mode === 'navigate') return e.respondWith(networkFirst(r));
  if (u.origin === location.origin && /\/_astro\/|\/icons\/|\.(css|js|svg|png|ico|woff2?)$/.test(u.pathname))
    return e.respondWith(cacheFirst(r, RT));
  if (u.hostname === 'res.cloudinary.com') return e.respondWith(cacheFirst(r, IMG));
});

async function networkFirst(r) {
  try {
    const res = await fetch(r);
    (await caches.open(RT)).put(r, res.clone());
    return res;
  } catch {
    return (await caches.match(r, { ignoreSearch: true })) || (await caches.match(BASE + 'offline.html'));
  }
}
async function cacheFirst(r, name) {
  const hit = await caches.match(r);
  if (hit) return hit;
  const res = await fetch(r);
  if (res.ok || res.type === 'opaque') (await caches.open(name)).put(r, res.clone());
  return res;
}