
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// WARNING: Hardcoding config like this is a security risk. Prefer .env.local variables.
const firebaseConfig = {
  apiKey: "AIzaSyCchkaeoM3p1q_KIgyHoNAjUycp8mybjeA",
  authDomain: "flexfit-gyoodev.firebaseapp.com",
  projectId: "flexfit-gyoodev",
  storageBucket: "flexfit-gyoodev.firebasestorage.app", // Corrected: was flexfit-gyoodev.appspot.com, changed to flexfit-gyoodev.firebasestorage.app
  messagingSenderId: "531011327579",
  appId: "1:531011327579:web:10f705e4e9a1b35eb2517e",
  measurementId: "G-B5C39FDK2L"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);
if (typeof window !== 'undefined') { // Initialize Analytics only on client
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
