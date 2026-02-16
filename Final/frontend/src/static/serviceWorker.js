function log(...data) {
  console.log("SWv1.5", ...data);
}

log("SW Script executing - adding event listeners");

const STATIC_CACHE_NAME = "wolfnotes-static-v3";

// maps frontend routes
const ROUTE_TO_FILE = {
  "/": "/index.html",
  "/login": "/pages/login.html",
  "/register/student": "/pages/studentRegister.html",
  "/register/instructor": "/pages/instructorRegister.html",
  "/student/home": "/pages/studentHomepage.html",
  "/student/notes": "/pages/myNotes.html",
  "/instructor/home": "/pages/instructorHomepage.html",
  "/instructor/profile": "/pages/instructorProfile.html",
};

function matchDynamicRoute(path) {
  if (path.startsWith("/class/")) return "/pages/classView.html";
  return null;
}


self.addEventListener('install', event => {
  log('install', event);
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      log('Opened cache');
      return cache.addAll([
        '/pages/offline.html',
        '/pages/classView.html',
        '/index.html',
        '/pages/instructorHomepage.html',
        '/pages/instructorRegister.html',
        '/pages/login.html',
        '/pages/myNotes.html',
        '/pages/studentHomepage.html',
        '/pages/studentRegister.html',
        '/pages/instructorProfile.html',
        '/css/instructorProfile.css',
        '/css/classView.css',
        '/css/instructorHomepage.css',
        '/css/landing.css',
        '/css/mynotes.css',
        '/css/register.css',
        '/css/studentHomepage.css',
        '/css/styles.css',
        '/css/offline.css',
        '/images/home_logo.png',
        '/images/like.png',
        '/images/logout_icon.png',
        '/images/icons/icon-128.png',
        '/images/icons/icon-256.png',
        '/images/icons/icon-512.png',
        '/images/user.png',
        '/js/APIClient.js',
        '/js/authCheck.js',
        '/js/classView.js',
        '/js/dbHelper.js',
        '/js/offlineHandler.js',
        '/js/HTTPClient.js',
        '/js/instructor_homepage.js',
        '/js/instructorRegister.js',
        '/js/login.js',
        '/js/my_notes.js',
        '/js/student_homepage.js',
        '/js/studentRegister.js',
      ]).catch(err => {
        log('Failed to cache some files:', err);
      });
    })
  );
  self.skipWaiting();
});

/**
 * Activates the service worker. Initiates cache
 */
self.addEventListener('activate', event => {
  log('activate', event);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter(cacheName => 
        cacheName.startsWith('wolfnotes-') && cacheName != STATIC_CACHE_NAME
      );
    }).then((oldCaches) => {
      return Promise.all(
        oldCaches.map(cacheName => {
          log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

/**
 * Handles every fetch request. 
 * 
 * If API request, pass through (don't cache - use IndexedDB instead)
 * 
 * If a non-get, use normal fetch
 * 
 * If a static asset, default to cache
 */
self.addEventListener("fetch", event => {
  const requestURL = new URL(event.request.url);

  if (event.request.mode === "navigate") {
  const url = new URL(event.request.url);
  let path = url.pathname;

  let fallbackFile = ROUTE_TO_FILE[path];

  if (!fallbackFile) {
    fallbackFile = matchDynamicRoute(path);
  }

  if (!fallbackFile) {
    fallbackFile = "/index.html";
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If online and successful, return the network response
        return response;
      })
      .catch(() => {
        // If offline or network fails, use cache
        return caches.match(fallbackFile)
          .then(res => {
            if (res) {
              return res;
            }
            return caches.match("/pages/offline.html");
          });
      })
  );
  return;
}
  
  // API requests: pass through without caching (IndexedDB handles data storage)
  if (requestURL.origin === self.location.origin && requestURL.pathname.startsWith("/api")) {
    event.respondWith(fetch(event.request));
    return;
  } 

  else if (event.request.method !== "GET") {
    event.respondWith(fetch(event.request));
    return;
  }

  else { // cache first (static assets only)
    event.respondWith(cacheFirst(event.request));
    return;
  }
});

/**
 * Helper function to fetch using network and store response in the cache
 * Only for static assets, NOT for API responses
 * @param {*} request request made to network
 * @returns response from fetch after caching
 */
async function fetchAndCache(request) {
  return fetch(request).then((response) => {
    if (response.ok && request.method === "GET") {
      const responseClone = response.clone();
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
        log('Cached:', request.url);
      });
    }
    return response;
  });
}

/**
 * Helper function to try to match cache before fetching
 * @param {*} request request to match
 * @returns cache hit or fetch
 */
function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) {
      return cached;
    } else {
      return fetchAndCache(request);
    }
  }).catch((error) => {
    // fallback for images
    if (request.destination === "image") {
      return caches.match("/images/home_logo.png");
    }

    return caches.match("/pages/offline.html");
  });
}

/**
 * Event listener for messages
 */
self.addEventListener('message', event => {
  log('message', event.data);
  
  if (event.data.action === 'skipWaiting') {
    log('skipWaiting requested');
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.delete(STATIC_CACHE_NAME).then(() => {
        log('Cache cleared by client request');
      })
    );
  }
});