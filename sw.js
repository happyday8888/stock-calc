// sw.js - 版本號，每次修改 HTML 後建議改一下這裡的數字
const CACHE_NAME = 'stock-calculator-v1.0.1';
const ASSETS_TO_CACHE = [
  'index.html',
  // 如果你有 manifest.json 或 icon，也要列在這裡
  'manifest.json'
];

// 安裝並強制快取資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // 強制跳過等待，讓新版 sw 立即生效
  );
});

// 激活並清理舊版快取
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
    }).then(() => self.clients.claim()) // 立即接管所有頁面
  );
});

// 攔截請求並優先從快取讀取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
