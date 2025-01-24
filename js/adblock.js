// 阻止所有广告相关的API和变量
window.googletag = {
    cmd: [],
    pubads: function() {
        return {
            addEventListener: function() {},
            setTargeting: function() {},
            enableSingleRequest: function() {},
            disableInitialLoad: function() {},
            refresh: function() {}
        };
    },
    enableServices: function() {}
};
window.google_ad_client = null;
window.ramp = null;
window.pbjs = {
    que: [],
    addAdUnits: function() {},
    requestBids: function() {},
    setConfig: function() {}
};

// 阻止第三方请求
const originalFetch = window.fetch;
const originalXHR = window.XMLHttpRequest;
const blockedDomains = [
    'doubleclick',
    'google-analytics',
    'googlesyndication',
    'tlx.3lift.com',
    'btloader',
    'intergient',
    'prebid',
    'pubmatic',
    'openx',
    'sync.min.js',
    'amazon-adsystem',
    'criteo',
    'adnxs',
    'rubiconproject',
    'adsystem',
    'adform',
    'casalemedia',
    'smartadserver',
    'advertising'
];

window.fetch = function(url, options) {
    if (typeof url === 'string' && blockedDomains.some(domain => url.includes(domain))) {
        console.log('Blocked fetch request to:', url);
        return Promise.resolve(new Response('', {status: 200}));
    }
    return originalFetch.apply(this, arguments);
};

window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const open = xhr.open;
    xhr.open = function() {
        const url = arguments[1];
        if (url && typeof url === 'string' && blockedDomains.some(domain => url.includes(domain))) {
            console.log('Blocked XHR request to:', url);
            throw new Error('Blocked request');
        }
        return open.apply(xhr, arguments);
    };
    return xhr;
};

// 移除广告相关元素
function removeAds() {
    const selectors = [
        'script[src*="sync.min.js"]',
        'script[src*="gpt.js"]',
        'script[src*="prebid"]',
        'script[src*="analytics"]',
        'script[src*="doubleclick"]',
        'script[src*="btloader"]',
        'script[src*="intergient"]',
        'iframe[src*="doubleclick"]',
        '#tcf-api-frame',
        '.__tcfapiLocator',
        'div[id^="google_ads"]',
        'ins.adsbygoogle',
        'div[data-ad]',
        'div[class*="ad-"]',
        '[id*="google_ads"]',
        '[id*="banner"]',
        '[class*="banner"]',
        '[id*="advert"]',
        '[class*="advert"]'
    ];
    
    // 移除匹配的元素
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // 移除内联脚本
    document.querySelectorAll('script').forEach(script => {
        if (script.textContent.includes('tcfapi') || 
            script.textContent.includes('googletag') || 
            script.textContent.includes('prebid') ||
            script.textContent.includes('sync.min.js')) {
            script.remove();
        }
    });
}

// 阻止脚本加载
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.tagName === 'SCRIPT' && node.src && 
                blockedDomains.some(domain => node.src.includes(domain))) {
                node.remove();
            }
        });
    });
});

// 开始观察DOM变化
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

// 定期清理广告
setInterval(removeAds, 100);
document.addEventListener('DOMContentLoaded', removeAds);

// 在页面加载完成后执行一次清理
window.addEventListener('load', removeAds);

// 创建一个虚拟的TCF API
window.__tcfapi = function(command, version, callback) {
    callback({
        eventStatus: 'tcloaded',
        gdprApplies: false,
        purpose: { consents: {} },
        vendor: { consents: {} }
    }, true);
};

// 创建一个虚拟的定位器iframe
try {
    const locatorFrame = document.createElement('iframe');
    if (locatorFrame) {
        locatorFrame.style.display = 'none';
        locatorFrame.name = '__tcfapiLocator';
        document.body.appendChild(locatorFrame);
    }
} catch (error) {
    console.log('Failed to create locator frame:', error);
}
