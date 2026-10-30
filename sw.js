
const cacheName = 'recetas-v2';

const staticAssets = [
    './',
    './index.html',
    './app.js',
    './app.css',
    './manifest.webmanifest',
    './Icono.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);

            for (const asset of staticAssets) {
                try {
                    const response = await fetch(asset);

                    if (response.ok) {
                        await cache.put(asset, response);
                    } else {
                        console.error('No se pudo guardar:', asset);
                    }
                } catch (error) {
                    console.error('Error al guardar:', asset, error);
                }
            }

            await self.skipWaiting();
        })()
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();

            await Promise.all(
                keys
                    .filter(key => key.startsWith('recetas-') && key !== cacheName)
                    .map(key => caches.delete(key))
            );

            await self.clients.claim();
        })()
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;

    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(req));
    } else if (url.href.startsWith('https://api-resetas-s4qf.onrender.com/')) {
        event.respondWith(networkAndCache(req));
    }
});

async function cacheFirst(req) {
    const cached = await caches.match(req);

    if (cached) {
        return cached;
    }

    return fetch(req);
}

async function networkAndCache(req) {
    const cache = await caches.open(cacheName);

    try {
        const response = await fetch(req);

        if (response.ok) {
            await cache.put(req, response.clone());
        }

        return response;
    } catch (error) {
        const cached = await cache.match(req);

        if (cached) {
            return cached;
        }

        return new Response('[]', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
