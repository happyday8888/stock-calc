// sw.js - 版本號：v20260316.19
const CACHE_NAME = 'stock-calculator-v20260316.19';

// ... 安裝與激活事件保持不變 ...

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 【解決版號不跳動的核心】
    // 針對首頁與 HTML 檔案，採用「網路優先」，失敗才用快取
    if (url.pathname === '/' || url.pathname.endsWith('index.html')) {
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

    // 其他資源（JS/CSS/圖示）維持現有快取策略
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
