// sw.js - 版本號：v20260316.17
// 每次修改 index.html 內容後，請務必跳動此版本號，以觸發使用者端的自動更新彈窗
const CACHE_NAME = 'stock-calculator-v20260316.17'; 
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json'
];

// 安裝並強制快取資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
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
          if (cache !== CACHE_NAME) {
            console.log('Cleaning old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

// 攔截請求：優化策略解決版本號殘留
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 關鍵修正：針對主頁 index.html 與 sw.js 本身，強制不使用瀏覽器 HTTP 快取
  if (url.pathname === '/' || url.pathname.endsWith('index.html') || url.pathname.endsWith('sw.js')) {
    event.respondWith(
      // 使用 cache: 'reload' 強制向伺服器驗證，確保拿到最新的 HTML 文字版號
      fetch(event.request, { cache: 'reload' })
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => caches.match(event.request)) // 離線時才回退到快取
    );
    return;
  }

  // 其餘資源維持原有的 Stale-while-revalidate 策略
  event.respondWith(
    caches.match(event.request).then((response) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {});
      return response || fetchPromise;
    })
  );
});

// 監聽來自 index.html 的強制更新指令
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
