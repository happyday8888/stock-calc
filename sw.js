/**
 * Service Worker - 台股交易損益試算器
 * 版本號：v20260316.05 (每次更新 index.html 後，請務必增加此數字)
 */

const VERSION = 'v20260316.05'; 
const CACHE_NAME = `stock-calculator-${VERSION}`;

// 定義需要快取的資源 (請確保這些檔案在你的 GitHub 根目錄都存在)
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
      console.log('[Service Worker] 開始預載入靜態資源');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 注意：這裡不呼叫 skipWaiting()，是為了讓使用者在 index.html 點擊彈窗後才更新
});

// --- 2. 擷取階段 (Fetch) ---
// 策略：網路優先 (Network First)，失敗後回退至快取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功抓到網路資料，將其複製並更新到快取中
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 沒網路時，回傳手機內的快取檔案
        return caches.match(event.request);
      })
  );
});

// --- 3. 激活階段 (Activate) ---
// 當新版本接管時，刪除所有舊版本的快取，釋放手機空間
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] 版本 ${VERSION} 正式啟動並接管`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log(`[Service Worker] 刪除舊快取: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // 確保新 Service Worker 立即取得頁面的控制權
      return self.clients.claim();
    })
  );
});

// --- 4. 訊息監聽 (Message) ---
// 接收來自 index.html 的指令
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    console.log('[Service Worker] 收到跳過等待指令，立即更新！');
    self.skipWaiting();
  }
});
