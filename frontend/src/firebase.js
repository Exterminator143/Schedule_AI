import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';

// Your web app's Firebase configuration
// Placeholders are used here natively, and must be replaced by the user
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let messaging;

export const initializeFirebase = () => {
  try {
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase config missing environment variables.');
      return null;
    }
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
};

export const requestNotificationPermission = async () => {
  if (!messaging) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // Get the FCM token and send it to the backend natively
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      console.log('Using VAPID Key (length):', vapidKey ? vapidKey.length : 'undefined', vapidKey ? vapidKey.substring(0, 5) + '...' : '');
      const token = await getToken(messaging, { vapidKey });
      if (token) {
        console.log('FCM Token:', token);
        await axios.post('https://schedule-ai.onrender.com/api/tasks/register-token', { token });
      } else {
        console.log('No registration token available.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });
