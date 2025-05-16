
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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined;

if (!firebaseConfig.apiKey) {
  console.error(
    'Firebase API key is missing. Please ensure your .env.local file is correctly set up with NEXT_PUBLIC_FIREBASE_API_KEY and other Firebase credentials.'
  );
  // @ts-ignore
  app = undefined;
} else if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Failed to initialize Firebase app. Check your firebaseConfig and .env.local file:', error);
    // @ts-ignore
    app = undefined; 
  }
} else {
  app = getApps()[0];
}

// Initialize Auth, Firestore, and Analytics only if app was successfully initialized
if (app!) { 
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
      }
    } else {
      // console.warn("Firebase Measurement ID is not set. Analytics will not be initialized.");
    }
  }
} else {
  if (firebaseConfig.apiKey) { // Only log this if an API key was provided but init still failed
    console.error("Firebase app is not initialized despite API key being present. Auth, Firestore, and Analytics will not be available.");
  }
  // @ts-ignore
  auth = undefined; 
  // @ts-ignore
  db = undefined;
  analytics = undefined;
}

export { app, auth, db, analytics };
