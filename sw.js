// sw.js
const CACHE_NAME = 'stock-calculator-live';

// 初始安裝時快取的資源
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    .then(() => self.skipWaiting())
  );
});

// 每次請求時，先從快取抓 (秒開)，但同時去網路抓新的並更新快取 (背景更新)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        // 同時發起網路請求去更新快取
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {}); // 沒網路時忽略錯誤

        // 優先回傳快取內容，沒快取才等網路
        return response || fetchPromise;
      });
    })
  );
});

// 清理舊快取 (如果未來真的需要改 CACHE_NAME)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); })
    )).then(() => self.clients.claim())
  );
});
