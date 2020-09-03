importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// This will trigger the importScripts() for workbox.strategies and its dependencies:
workbox.loadModule('workbox-strategies');
workbox.loadModule('workbox-routing');
workbox.loadModule('workbox-expiration');
workbox.loadModule('workbox-precaching');


if (workbox) {
  workbox.routing.registerRoute(
    new RegExp('\.css$'),
    new workbox.strategies.CacheFirst({
      cacheName: 'My-awesome-cache-Stylesheets',
    })
  );

  workbox.routing.registerRoute(
    new RegExp('\.js$'),
    new workbox.strategies.CacheFirst({
      cacheName: 'My-awesome-cache-js',
    })
  );

  workbox.routing.registerRoute(
    new RegExp('\.html$'),
    new workbox.strategies.CacheFirst({
      cacheName: 'My-awesome-cache-html',
    })
  );

  workbox.routing.registerRoute(
    new RegExp('\.(png|svg|jpg|jpeg)$'),
    new workbox.strategies.CacheFirst({
      cacheName: 'My-awesome-cache-Images',
    })
  );

  workbox.routing.registerRoute(
    new RegExp('https://api-ratp.pierre-grimaud.fr/v3/schedules/'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'My-awesome-cache-schedules',
      cacheExpiration: {
        maxAgeSeconds: 60 * 30 //cache the news content for 30mn
      }
    })
  );

  workbox.precaching.precacheAndRoute([
    'index.html',
      '/scripts/app.js',
      '/scripts/idb.js',
      '/styles/inline.css',
      '/images/ic_add_white_24px.svg',
      '/images/ic_refresh_white_24px.svg',
  ]);

}



/*
// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v4';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/scripts/app.js",
    "/scripts/idb.js",
    "/styles/inline.css",
    "/images/ic_add_white_24px.svg",
    "/images/ic_refresh_white_24px.svg"
];

self.addEventListener('install', function(evt) {
    console.log('[ServiceWorker] Install');
    evt.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });

  self.addEventListener('activate', (evt) => {
    console.log('[ServiceWorker] Activate');
    // CODELAB: Remove previous cached data from disk.
    evt.waitUntil(
        caches.keys().then((keyList) => {
          return Promise.all(keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log('[ServiceWorker] Removing old cache', key);
              return caches.delete(key);
            }
          }));
        })
    );
    self.clients.claim();
  });

  self.addEventListener('fetch', (evt) => {
    console.log('[ServiceWorker] Fetch', evt.request.url);
    // CODELAB: Add fetch event handler here.
    if (evt.request.url.includes('/schedules/')) {
        console.log('[Service Worker] Fetch (data)', evt.request.url);
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
              return fetch(evt.request)
                  .then((response) => {
                    // If the response was good, clone it and store it in the cache.
                    if (response.status === 200) {
                      cache.put(evt.request.url, response.clone());
                    }
                    return response;
                  }).catch((err) => {
                    // Network request failed, try to get it from the cache.
                    return cache.match(evt.request);
                  });
            }));
        return;
      }
      evt.respondWith(
          caches.open(CACHE_NAME).then((cache) => {
            return cache.match(evt.request)
                .then((response) => {
                  return response || fetch(evt.request);
                });
          })
      );
  });*/