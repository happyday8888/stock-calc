/**
 * Service Worker - 台股交易損益試算器
 * 版本號：v20260316.11 (每次修改代碼後，請務必手動增加此數字)
 */

const VERSION = 'v20260316.11'; 
const CACHE_NAME = `stock-calculator-${VERSION}`;

// 定義需要快取的靜態資源
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com'
];

// --- 1. 安裝階段 (Install) ---
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] 正在安裝新版本: ${VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] 預載入靜態資源中...');
      // 使用 cache.addAll 確保關鍵檔案都存入手機
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 不在這裡使用 self.skipWaiting()，因為我們要等 index.html 彈窗後的指令
});

// --- 2. 擷取階段 (Fetch) ---
// 策略：強效網路優先 (Network First)
// 確保只要有網路，就一定拿最新的內容，沒網路才用快取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功抓到最新資料，更新到快取中
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 沒網路時，才回傳快取檔案
        return caches.match(event.request);
      })
  );
});

// --- 3. 激活階段 (Activate) ---
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] 版本 ${VERSION} 正式啟動並準備接管`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          // 刪除所有不是目前版本 (CACHE_NAME) 的舊快取
          if (name !== CACHE_NAME) {
            console.log(`[Service Worker] 刪除舊快取檔案: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // 讓新的 Service Worker 立即取得控制權
      return self.clients.claim();
    })
  );
});

// --- 4. 訊息監聽 (Message) ---
// 接收來自 index.html 的 SKIP_WAITING 指令
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    console.log('[Service Worker] 收到跳過等待指令，立即更新！');
    self.skipWaiting();
  }
});
