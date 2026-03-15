// sw.js - 版本號：每次修改 HTML 或 CSS 後，改一下這個數字 (例如 1.0.1 -> 1.0.2)
const CACHE_NAME = 'stock-calculator-v1.0.0';

// 需要快取的資源清單
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'icon-512.png' // 確保圖片也被加入快取，這樣離線時才能顯示 Icon
];

// 1. 安裝階段：將資源寫入快取
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: 正在快取檔案');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // 強制跳過等待，讓新版 SW 立即生效
  );
});

// 2. 激活階段：清理舊版本的快取空間
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: 清理舊快取', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // 立即接管所有開啟中的分頁
  );
});

// 3. 擷取階段：攔截請求，優先讀取快取（實現離線開啟）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果快取有資料就回傳，沒有就去網路抓
      return response || fetch(event.request);
    })
  );
});
