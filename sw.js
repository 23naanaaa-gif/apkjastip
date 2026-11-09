const CACHE_NAME = 'jastip-pro-pwa-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.png'
];

// 1. Install: Gunakan cache.addAll standar agar lolos verifikasi offline installability Chrome Android,
// lalu panggil skipWaiting() setelah cache siap agar tidak mengganggu event beforeinstallprompt.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// 2. Activate: Bersihkan cache versi lama dan klaim client aktif
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Message listener untuk trigger update instan dari aplikasi
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch: Strategi Network-First untuk dokumen HTML & aset lokal agar setiap ada update di GitHub
// langsung terambil versi barunya, sekaligus selalu mengembalikan Response valid saat dicek offline oleh Chrome.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Jangan intercept koneksi real-time Firebase Auth & Cloud Firestore
  if (
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('identitytoolkit.googleapis.com') ||
    url.origin.includes('securetoken.googleapis.com')
  ) {
    return;
  }

  // Untuk navigasi halaman (index.html) & file di dalam GitHub Pages yang sama:
  // Utamakan jaringan terbaru (Network-First), simpan ke cache, dan fallback ke cache jika offline.
  if (event.request.mode === 'navigate' || url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Untuk resource eksternal (CDN): Cache-First dengan fallback jaringan
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
