const CACHE_NAME='awa-cache-v1';
const OFFLINE_URL='/offline.html';

// Simple service worker for push notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll(['/',OFFLINE_URL]);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'You have a new update!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'kigali-ride',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Kigali Ride', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

self.addEventListener('fetch',e=>{
 if(e.request.mode==='navigate'){
   e.respondWith((async()=>{
     try{
       const preload=await e.preloadResponse;
       if(preload) return preload;
       return await fetch(e.request);
     }catch(err){
       const cache=await caches.open(CACHE_NAME);
       return await cache.match(OFFLINE_URL);
     }
   })());
 }
});
