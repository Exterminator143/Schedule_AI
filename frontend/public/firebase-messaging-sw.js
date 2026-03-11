// Scripts for firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Must match the config used in the main app
// The User will have to replace these placeholders manually if building this properly,
// but for the sake of completion this defines the correct Worker context.
// In a real VITE setup we'd use a bundler or an endpoint to supply config securely to the worker.
firebase.initializeApp({
  apiKey: "AIzaSyCeWhXxNBCwBUasZ5r9FpuaS8WqzJHH18E",
  authDomain: "schedule-fire-91932.firebaseapp.com",
  projectId: "schedule-fire-91932",
  storageBucket: "schedule-fire-91932.firebasestorage.app",
  messagingSenderId: "1056529846497",
  appId: "1:1056529846497:web:2fc1d790dc605979d5e7a0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
