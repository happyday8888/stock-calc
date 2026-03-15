// sw.js - 版本號：v20260316.08
// 每次修改 index.html 內容後，請務必跳動此版本號，以觸發使用者端的自動更新彈窗
const CACHE_NAME = 'stock-calculator-v20260316.08'; 
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json'
];

// 安裝並強制快取資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 使用 fetch 模式確保抓到最新的檔案
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // 強制跳過等待
  );
});

// 激活並清理舊版快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // 清理掉所有不是當前 CACHE_NAME 的舊快取
          if (cache !== CACHE_NAME) {
            console.log('Cleaning old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // 立即接管所有頁面
  );
});

// 攔截請求：優先從快取讀取，並在背景嘗試更新
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 即使快取命中，也發起一個 fetch 去更新資源 (Stale-while-revalidate)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // 確保請求成功才更新快取
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
          // 網路斷線時不報錯
      });

      return response || fetchPromise;
    })
  );
});
