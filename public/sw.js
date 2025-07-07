const CACHE_NAME = 'kigali-ride-cache-v2';
const OFFLINE_URL = '/offline.html';

// Core assets to cache for offline functionality
const CORE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  // Add key app routes for offline access
  '/passenger/home',
  '/driver/home',
  '/role-select'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('Kigali Ride Service Worker installing');
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      console.log('Core assets cached successfully');
      self.skipWaiting();
    } catch (error) {
      console.error('Failed to cache core assets:', error);
    }
  })());
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Kigali Ride Service Worker activating');
  event.waitUntil((async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
      self.clients.claim();
      console.log('Service Worker activated and old caches cleaned');
    } catch (error) {
      console.error('Failed to activate service worker:', error);
    }
  })());
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

// Enhanced fetch handler for offline support
self.addEventListener('fetch', (event) => {
  // Handle navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Try to get preloaded response first
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) return preloadResponse;
        
        // Try network request
        const networkResponse = await fetch(event.request);
        
        // Cache successful responses
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        console.log('Network request failed, serving offline page:', error);
        
        // Try to serve from cache first
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;
        
        // Fallback to offline page
        return await cache.match(OFFLINE_URL);
      }
    })());
  }
  
  // Handle API requests - cache strategy for better offline experience
  else if (event.request.url.includes('/api/') || event.request.url.includes('/functions/')) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(event.request);
        
        // Cache successful API responses (except POST requests)
        if (networkResponse.ok && event.request.method === 'GET') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // For API requests, try cache but don't fall back to offline page
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          console.log('Serving API request from cache:', event.request.url);
          return cachedResponse;
        }
        
        // Return network error for API calls when offline
        throw error;
      }
    })());
  }
  
  // Handle static assets (CSS, JS, images)
  else if (event.request.destination === 'script' || 
           event.request.destination === 'style' || 
           event.request.destination === 'image') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Try cache first for static assets
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;
      
      // Try network and cache the response
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.log('Failed to fetch static asset:', event.request.url);
        throw error;
      }
    })());
  }
});
