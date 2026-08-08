const CACHE_NAME = 'forge-pwa-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Helper function to check if URL is cacheable (HTTP/HTTPS only)
function isCacheable(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Helper function to check if request is an API call
function isApiRequest(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.startsWith('/api/');
  } catch (e) {
    return false;
  }
}

// Helper function to check if request is a dynamic route that shouldn't be cached
function isDynamicRoute(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Skip profile pages and other dynamic routes
    return pathname.startsWith('/profile/') || 
           pathname.startsWith('/chat/') ||
           pathname.startsWith('/event/') ||
           pathname.startsWith('/survey/');
  } catch (e) {
    return false;
  }
}

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Filter out non-cacheable URLs
        const cacheableUrls = urlsToCache.filter(url => isCacheable(url));
        return cache.addAll(cacheableUrls);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-HTTP/HTTPS requests (chrome-extension, file://, etc.)
  if (!isCacheable(event.request.url)) {
    return;
  }

  // Skip API requests - let them go directly to network
  if (isApiRequest(event.request.url)) {
    return;
  }

  // Skip dynamic routes - let them go directly to network
  if (isDynamicRoute(event.request.url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache if the request is cacheable
              if (isCacheable(event.request.url)) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncRequests());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'ForgeConnect',
    body: 'New notification from ForgeConnect',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/',
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        ...data,
        ...payload,
        data: {
          url: payload.data?.url || '/',
          dateOfArrival: Date.now(),
          primaryKey: payload.data?.primaryKey || 1,
          ...payload.data
        }
      };
    }
  } catch (e) {
    console.error('Error parsing push notification payload:', e);
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: data.vibrate,
    data: data.data,
    requireInteraction: true,
    tag: data.data?.tag || 'forge-connect-notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Sync requests function (placeholder for actual implementation)
function syncRequests() {
  // Implement sync logic here
  return Promise.resolve();
}
