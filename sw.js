// sw.js - 版本號：v20260316.04
// 每次修改 index.html 內容後，請務必跳動此版本號，以觸發使用者端的自動更新彈窗
const CACHE_NAME = 'stock-calculator-v20260316.04'; 
const ASSETS_TO_CACHE = [
  'index.html',
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
            console.log('Cleaning old cache:', cache);
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
      // 優先回傳快取內容，若無快取則發起網路請求
      return response || fetch(event.request);
    })
  );
});
