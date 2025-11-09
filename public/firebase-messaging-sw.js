/**
 * Firebase Messaging Service Worker
 * Handles background push notifications
 *
 * This file must be in the public directory and served at the root of your domain
 * It runs in the background even when the app is closed
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// Note: These values should match your main Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCMaIL4BL1qbA1xj0Ot4iGmawXAO8o3PD4",
  authDomain: "excelmind-test.firebaseapp.com",
  projectId: "excelmind-test",
  storageBucket: "excelmind-test.firebasestorage.app",
  messagingSenderId: "479007511194",
  appId: "1:479007511194:web:8ab3093de9fa4d6e934523",
  measurementId: "G-SQ0NJDPQZT"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: payload.notification?.badge || '/favicon.ico',
    data: payload.data || {},
    tag: payload.data?.notification_id || 'default',
    requireInteraction: payload.data?.priority === 'high',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event.notification);

  event.notification.close();

  // Get the action URL from notification data
  const actionUrl = event.notification.data?.action_url;
  const urlToOpen = actionUrl ? `${self.location.origin}${actionUrl}` : self.location.origin;

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
