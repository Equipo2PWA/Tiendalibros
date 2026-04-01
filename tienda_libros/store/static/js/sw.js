const CACHE_NAME   = 'libreria-v4';   
const CACHE_ASSETS = 'libreria-assets-v4';

const STATIC_ASSETS = [
    '/static/css/style.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
];

const BYPASS_PATTERNS = [
    /paypal/,
    /api\/cart/,
    /confirmar-pago/,
    /admin/,
];

const NETWORK_FIRST_PATTERNS = [
    /accounts\/login/,
    /accounts\/logout/,
    /register/,
    /\/$/,         
    /\/cart\//,
    /\/book\//,
    /\/contact\//,
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_ASSETS)
            .then(c => c.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())   
});


self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_NAME && k !== CACHE_ASSETS)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim()) 
    );
});

self.addEventListener('fetch', event => {
    const url = event.request.url;

    if (event.request.method !== 'GET') return;

    if (BYPASS_PATTERNS.some(p => p.test(url))) return;

    if (
        NETWORK_FIRST_PATTERNS.some(p => p.test(url)) ||
        event.request.headers.get('accept')?.includes('text/html')
    ) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    event.respondWith(cacheFirst(event.request));
});

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (_) {
        const cached = await caches.match(request);
        return cached || new Response(
            '<h2>Sin conexión</h2><p>Esta página no está disponible offline.</p>',
            { headers: { 'Content-Type': 'text/html' } }
        );
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);

    const networkFetch = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            caches.open(CACHE_ASSETS).then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => null);

    return cached || await networkFetch;
}
