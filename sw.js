/**
 * Service Worker - 台股交易損益試算器
 * * 更新說明：
 * 每次修改 index.html 後，請務必手動修改下方的 VERSION 版本號。
 * 例如：v20260316.01 -> v20260316.02
 */

const VERSION = 'v20260316.02'; // <--- 每次上傳前改這裡
const CACHE_NAME = `stock-calculator-${VERSION}`;

// 定義需要快取的資源
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com', // 快取外部 CSS 庫，確保離線可用
  // 如果你有圖示，請確保檔名正確
  'icon-512.png'
];

// --- 1. 安裝階段 (Install) ---
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] 正在安裝版本: ${VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] 預載入快取項目');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 不使用 self.skipWaiting()，為了配合 index.html 的更新彈窗
});

// --- 2. 擷取階段 (Fetch) ---
// 策略：網路優先 (Network First)，失敗後回退至快取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功抓到網路資料，順便更新快取
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
// 清理舊版本的快取，避免佔用使用者手機空間
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] 版本 ${VERSION} 已啟動`);
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
    }).then(() => self.clients.claim())
  );
});

// 監聽來自 index.html 的指令，強制跳過等待 (配合彈窗點擊更新)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
