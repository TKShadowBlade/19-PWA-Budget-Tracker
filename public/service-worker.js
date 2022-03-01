const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
    "/",
    "/public/index.html",
    "/public/index.js",
    "/public/styles.css",
    "/public/icons/icon-192x192.png",
    "/public/icons/icon-512x512.png",
    "/public/indexdb.js",
    "/public/manifest.json"
];

// This installs the service worker
self.addEventListener('install', (evt) => {
    
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Files pre-cached successfully');
            return cache.addAll(FILES_TO_CACHE)
        })
    );
});

// This switches on the service worker
self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Clearing old data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// This fetches the necessary files
self.addEventListener('fetch', (evt) => {
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    // if response is good, clone and store in the cache
                    if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                // If network request fails, try to pull from the cache
                .catch(err => {
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );
        return;
    }

    evt.respondWith(
        fetch(evt.request).catch(() => {
            return caches.match(evt.request).then((response) => {
                if(response) {
                    return response;
                } else if (evt.request.headers.get('accept').includes('text/html')) {
                    // return the cached homepage for all html page requests
                    return caches.match('/');
                }
            })
        })
    );
});

