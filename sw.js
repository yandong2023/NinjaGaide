// Service Worker to block ad requests
self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});

// 广告域名列表
const AD_DOMAINS = [
    'doubleclick.net',
    'google-analytics.com',
    'googleadservices.com',
    'googlesyndication.com',
    'googletagmanager.com',
    'googletagservices.com',
    'btloader.com',
    'intergient.com'
];

// 拦截网络请求
self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
    
    // 检查是否是广告请求
    if (AD_DOMAINS.some(domain => url.hostname.includes(domain))) {
        // 返回空响应
        event.respondWith(new Response('', {
            status: 200,
            statusText: 'OK'
        }));
        return;
    }
    
    // 对于非广告请求，正常处理
    event.respondWith(fetch(event.request));
});
