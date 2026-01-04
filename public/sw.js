const CACHE_NAME = 'time-tracker-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Basic pass-through for now to ensure app works
    // Can be enhanced with caching strategies later
    event.respondWith(fetch(event.request));
});
