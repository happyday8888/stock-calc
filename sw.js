// sw.js - 版本號：v20260316.21
const CACHE_NAME = 'stock-calculator-v20260316.21';

const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'manifest.json',
    'https://cdn.tailwindcss.com'
];

// 安裝事件：立即跳過等待
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 激活事件：清除舊版本的快取
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

// 核心請求攔截策略
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 【解決版號不跳動的核心】
    // 針對首頁與 HTML 檔案，採用「網路優先」，失敗才用快取
    if (url.pathname === '/' || url.pathname.endsWith('index.html') || url.pathname.endsWith('stock-calculator/')) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                })
                .catch(() => caches.match(event.request)) 
        );
        return;
    }

    // 其他資源（JS/CSS/圖示）維持「快取優先」以提升載入速度
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            });
        })
    );
});

// 監聽來自 index.html 的手動更新指令
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
