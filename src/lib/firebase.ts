
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableIndexedDbPersistence } from 'firebase/firestore'; // Added enableIndexedDbPersistence
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// WARNING: Hardcoding config like this is a security risk. Prefer .env.local variables.
const firebaseConfig = {
  apiKey: "AIzaSyCchkaeoM3p1q_KIgyHoNAjUycp8mybjeA",
  authDomain: "flexfit-gyoodev.firebaseapp.com",
  projectId: "flexfit-gyoodev",
  storageBucket: "flexfit-gyoodev.firebasestorage.app",
  messagingSenderId: "531011327579",
  appId: "1:531011327579:web:10f705e4e9a1b35eb2517e",
  measurementId: "G-B5C39FDK2L"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics; // Declared, will be initialized client-side

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

// Enable offline persistence for Firestore
// This should be done after Firestore is initialized and ideally only once.
if (typeof window !== 'undefined') { // Firestore persistence only works in a browser environment
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Firestore offline persistence enabled successfully.");
    })
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        // This can happen if multiple tabs are open, as persistence can only be
        // enabled in one tab at a time.
        console.warn("Firestore offline persistence failed: Failed precondition (e.g., multiple tabs open).");
      } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence.
        console.warn("Firestore offline persistence failed: Browser does not support required features.");
      } else {
        console.error("Firestore offline persistence failed with error:", err);
      }
    });
}

if (typeof window !== 'undefined') { // Initialize Analytics only on client
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Analytics:", error);
  }
}

export { app, auth, db, analytics };
