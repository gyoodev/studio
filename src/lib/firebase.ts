
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let analytics: Analytics | undefined;

if (!firebaseConfig.apiKey) {
  console.error(
    'Firebase API key is missing. Please ensure your .env.local file is correctly set up in the project ROOT with NEXT_PUBLIC_FIREBASE_API_KEY and other Firebase credentials. Restart your dev server after creating/modifying .env.local.'
  );
  app = undefined;
} else if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Failed to initialize Firebase app. Check your firebaseConfig and .env.local file:', error);
    app = undefined;
  }
} else {
  app = getApps()[0];
}

if (app) {
  auth = getAuth(app);
  db = getFirestore(app);

  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db)
      .then(() => {
        // console.log("Firestore offline persistence enabled successfully.");
      })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn("Firestore offline persistence failed: Failed precondition (e.g., multiple tabs open).");
        } else if (err.code === 'unimplemented') {
          console.warn("Firestore offline persistence failed: Browser does not support required features.");
        } else {
          console.error("Firestore offline persistence failed with error:", err);
        }
      });

    if (firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.error("Failed to initialize Firebase Analytics:", error);
        analytics = undefined;
      }
    } else {
      console.warn("Firebase Measurement ID is not set in .env.local. Analytics (telemetry) will not be initialized. Please set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID.");
      analytics = undefined;
    }
  }
} else {
  // If app initialization failed, ensure auth, db, analytics are undefined
  auth = undefined;
  db = undefined;
  analytics = undefined;
  // A general error about app initialization (or missing API key) would have been logged above.
}

export { app, auth, db, analytics };
