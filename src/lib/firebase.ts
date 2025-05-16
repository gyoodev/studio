
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration (Hardcoded as per user request)
// WARNING: Hardcoding credentials is a security risk. Use environment variables for production.
const firebaseConfig = {
  apiKey: "AIzaSyCchkaeoM3p1q_KIgyHoNAjUycp8mybjeA",
  authDomain: "flexfit-gyoodev.firebaseapp.com",
  projectId: "flexfit-gyoodev",
  storageBucket: "flexfit-gyoodev.firebasestorage.app", // Corrected from .appspot.com if previously different
  messagingSenderId: "531011327579",
  appId: "1:531011327579:web:10f705e4e9a1b35eb2517e",
  measurementId: "G-B5C39FDK2L"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined;

// Initialize Firebase
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Failed to initialize Firebase app. Check your firebaseConfig:", error);
    // @ts-ignore
    app = undefined; 
  }
} else {
  app = getApps()[0];
}

// Initialize Auth, Firestore, and Analytics only if app was successfully initialized
if (app!) { // The '!' asserts that app is not undefined here, assuming init was successful
  auth = getAuth(app);
  db = getFirestore(app);

  // Enable offline persistence for Firestore
  if (typeof window !== 'undefined') { 
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

    // Initialize Analytics only on client-side and if measurementId is present
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
