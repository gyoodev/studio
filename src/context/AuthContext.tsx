
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // auth and db can be undefined here
import { Preloader } from '@/components/layout/Preloader';

interface UserProfile extends User {
  displayName?: string | null;
  photoURL?: string | null;
  createdAt?: Timestamp | Date | null;
  lastLogin?: Timestamp | Date | null;
  subscriptionPlan?: "free" | "premium" | "platinum" | "diamond" | string;
  subscriptionStatus?: "active" | "inactive" | "cancelled" | "past_due";
  subscriptionBuyDate?: Timestamp | Date | null;
  subscriptionExpiryDate?: Timestamp | Date | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<UserProfile | null>;
  signInWithEmail: (email: string, password: string) => Promise<UserProfile | null>;
  signInWithGoogle: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  fetchUserProfile: (firebaseUser: User, forceRefresh?: boolean) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSideCheckComplete, setClientSideCheckComplete] = useState(false);
  const [currentPathname, setCurrentPathname] = useState('');
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPathname(window.location.pathname);
    }
    if (!auth || !db) {
      setError("Firebase is not configured correctly. Please check your API keys in .env.local and restart the server.");
      setLoading(false);
      setClientSideCheckComplete(true);
      setFirebaseAvailable(false);
      return;
    }
    setFirebaseAvailable(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
      setClientSideCheckComplete(true);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async (firebaseUser: User, forceRefresh: boolean = false): Promise<UserProfile | null> => {
    if (!firebaseAvailable || !db) { // Guard against undefined db
        setError("Firebase database is not available.");
        setLoading(false);
        return null;
    }
    
    const targetUser = forceRefresh && auth?.currentUser ? auth.currentUser : firebaseUser;
    if (!targetUser) {
        setLoading(false);
        return null;
    }

    // setLoading(true); // Avoid setting loading to true if it's just a background refresh
    try {
      const userDocRef = doc(db, 'users', targetUser.uid);
      let userDocSnap = await getDoc(userDocRef);
      let existingData = userDocSnap.exists() ? userDocSnap.data() : {};

      if (existingData?.subscriptionStatus === "active" && existingData?.subscriptionExpiryDate) {
        const expiryDate = (existingData.subscriptionExpiryDate as Timestamp).toDate();
        if (expiryDate < new Date()) {
          const expiredSubUpdate = {
            subscriptionPlan: "free",
            subscriptionStatus: "inactive",
          };
          await updateDoc(userDocRef, expiredSubUpdate);
          existingData = { ...existingData, ...expiredSubUpdate };
        }
      }

      const profileDataToSet: Partial<UserProfile> = {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.displayName || existingData?.displayName || targetUser.email?.split('@')[0] || 'User',
        photoURL: targetUser.photoURL || existingData?.photoURL || null,
        lastLogin: serverTimestamp(),
        subscriptionPlan: existingData?.subscriptionPlan || "free",
        subscriptionStatus: existingData?.subscriptionStatus || "inactive",
        subscriptionBuyDate: existingData?.subscriptionBuyDate || null,
        subscriptionExpiryDate: existingData?.subscriptionExpiryDate || null,
      };

      const updateData: Record<string, any> = {
        lastLogin: profileDataToSet.lastLogin,
        displayName: profileDataToSet.displayName,
        photoURL: profileDataToSet.photoURL,
        email: profileDataToSet.email, // Keep email in sync
      };

      if (!userDocSnap.exists()) {
        updateData.createdAt = serverTimestamp();
        updateData.subscriptionPlan = "free";
        updateData.subscriptionStatus = "inactive";
        await setDoc(userDocRef, updateData);
      } else {
        // Only update subscription fields if they were explicitly part of an update (like expiry)
        if (existingData.subscriptionPlan !== profileDataToSet.subscriptionPlan) {
            updateData.subscriptionPlan = profileDataToSet.subscriptionPlan;
        }
        if (existingData.subscriptionStatus !== profileDataToSet.subscriptionStatus) {
            updateData.subscriptionStatus = profileDataToSet.subscriptionStatus;
        }
        await updateDoc(userDocRef, updateData);
      }
      
      const finalUserDocSnap = await getDoc(userDocRef);
      const finalDatabaseData = finalUserDocSnap.exists() ? finalUserDocSnap.data() : {};

      const fullUserProfile = {
        ...targetUser, // Raw Firebase User (uid, email, photoURL, displayName from provider)
        ...(finalDatabaseData as Omit<UserProfile, keyof User>), // Firestore data
        // Ensure latest auth provider info (from targetUser) and calculated/default values are prioritized
        displayName: profileDataToSet.displayName, 
        photoURL: profileDataToSet.photoURL,
        email: profileDataToSet.email,
        subscriptionPlan: profileDataToSet.subscriptionPlan,
        subscriptionStatus: profileDataToSet.subscriptionStatus,
        subscriptionBuyDate: profileDataToSet.subscriptionBuyDate,
        subscriptionExpiryDate: profileDataToSet.subscriptionExpiryDate,
      } as UserProfile;

      setUser(fullUserProfile);
      return fullUserProfile;
    } catch (e) {
      console.error("Error fetching/updating user profile in Firestore:", e);
      setError((e as Error).message);
      const fallbackProfile = {
        ...targetUser,
        displayName: targetUser.displayName || targetUser.email?.split('@')[0] || 'User',
        photoURL: targetUser.photoURL || null,
        subscriptionPlan: "free",
        subscriptionStatus: "inactive",
      } as UserProfile;
      setUser(fallbackProfile);
      return fallbackProfile;
    } finally {
      if (!forceRefresh) setLoading(false); // Only set loading false if it's not a silent refresh
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<UserProfile | null> => {
    if (!auth || !db) {
      setError("Firebase is not configured correctly. Cannot sign up.");
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userProfileData: Partial<UserProfile> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || firebaseUser.email?.split('@')[0] || 'New User',
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        subscriptionPlan: "free",
        subscriptionStatus: "inactive",
        subscriptionBuyDate: null,
        subscriptionExpiryDate: null,
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);
      
      // Fetch the complete profile to ensure all fields (like Timestamps) are correctly hydrated
      return await fetchUserProfile(firebaseUser);
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<UserProfile | null> => {
    if (!auth) {
      setError("Firebase authentication is not configured. Cannot sign in.");
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return await fetchUserProfile(userCredential.user);
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    if (!auth || !db) {
      setError("Firebase is not configured correctly. Cannot sign in with Google.");
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return await fetchUserProfile(result.user);
    } catch (e) {
      setError((e as Error).message);
      console.error("Google Sign-In Error:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
      setError("Firebase authentication is not configured. Cannot log out.");
      return;
    }
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };
  
  const showGlobalLoader = (!firebaseAvailable && loading) || (firebaseAvailable && loading && !clientSideCheckComplete && currentPathname !== '/login' && currentPathname !== '/signup');

  if (showGlobalLoader) {
    return <Preloader />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signUpWithEmail, signInWithEmail, signInWithGoogle, logout, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
