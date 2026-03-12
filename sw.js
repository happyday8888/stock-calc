const CACHE_NAME = 'stock-calc-v' + Date.now(); // 每次存檔都會產生新版本號

self.addEventListener('install', (event) => {
    self.skipWaiting(); // 強制跳過等待，立刻激活新版本
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // 刪除舊快取
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
