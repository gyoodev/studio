
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics, type Analytics } from "firebase/analytics";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined; // Can be undefined if init fails or on server

// Initialize Firebase
if (!getApps().length) {
  if (!firebaseConfig.apiKey) {
    console.error("Firebase API Key is missing. Check your .env.local file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is set.");
    // Potentially throw an error or handle this state if critical for app startup
    // For robust error handling, you might want to throw here if apiKey is essential
  }
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Failed to initialize Firebase app. Check your firebaseConfig:", error);
    // Prevent further Firebase SDK calls if initialization fails
    // @ts-ignore
    app = undefined; 
  }
} else {
  app = getApps()[0];
}

// Initialize Auth and Firestore only if app was successfully initialized
if (app!) {
  auth = getAuth(app);
  db = getFirestore(app);

  // Enable offline persistence for Firestore
  if (typeof window !== 'undefined') { // Firestore persistence only works in a browser environment
    enableIndexedDbPersistence(db)
      .then(() => {
        // console.log("Firestore offline persistence enabled successfully.");
      })
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          console.warn("Firestore offline persistence failed: Failed precondition (e.g., multiple tabs open).");
        } else if (err.code == 'unimplemented') {
          console.warn("Firestore offline persistence failed: Browser does not support required features.");
        } else {
          console.error("Firestore offline persistence failed with error:", err);
        }
      });

    // Initialize Analytics only on client-side and if measurementId is present and app initialized
    if (firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.error("Failed to initialize Firebase Analytics:", error);
      }
    } else {
      // console.warn("Firebase Measurement ID is not set. Analytics will not be initialized.");
    }
  }
} else {
  console.error("Firebase app is not initialized. Auth, Firestore, and Analytics will not be available.");
  // @ts-ignore
  auth = undefined; 
  // @ts-ignore
  db = undefined;
  analytics = undefined;
}


export { app, auth, db, analytics };
