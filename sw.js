// 最後更新版本號：V20260316.01 (修改此字串即可觸發客戶端更新偵測)
const VERSION = 'v20260316.01';
const CACHE_NAME = `stock-calculator-${VERSION}`;

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com' // 建議將常用的外部庫也快取起來，確保離線可用
];

// 安裝階段
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('正在預載入快取項目...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 注意：這裡移除了 self.skipWaiting()
  // 這樣新版 SW 就會進入「等待中」狀態，直到 index.html 裡的跳出視窗讓使用者點擊更新
});

// 擷取階段 (網路優先，失敗後回傳快取 - 適合頻繁更新的應用)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// 激活階段 (清理舊版的快取檔案)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('清理舊快取:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
