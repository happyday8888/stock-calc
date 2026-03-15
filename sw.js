// 最後更新時間：2026-03-16 00:15 (每次上傳前修改這裡，即可觸發使用者手機彈窗)
const CACHE_NAME = 'stock-calculator-live';

const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'icon-512.png'
];

// 安裝階段
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    .then(() => self.skipWaiting()) // 強制新版 SW 立即進入等待啟用狀態
  );
});

// 擷取階段 (背景更新策略)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {});
        return response || fetchPromise;
      });
    })
  );
});

// 激活階段
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); })
    )).then(() => self.clients.claim())
  );
});
