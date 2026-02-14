
// This file should be deleted.
// Service Worker functionality has been removed.
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', () => {
  self.registration.unregister();
});
