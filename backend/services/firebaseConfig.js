const admin = require('firebase-admin');

// Function to initialize firebase admin SDK
const initFirebaseAdmin = () => {
  try {
    if (process.env.FIREBASE_PROJECT_ID && !admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle multiline private key correctly
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.log('Firebase Admin not initialized: Missing environment variables or already initialized.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
};

module.exports = { initFirebaseAdmin };
