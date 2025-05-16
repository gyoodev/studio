
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
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, Timestamp } from 'firebase/firestore'; // Added Timestamp
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface UserProfile extends User {
  displayName?: string | null;
  photoURL?: string | null;
  // Subscription fields
  subscriptionPlan?: "free" | "premium" | "platinum" | "diamond" | string; // Added string for flexibility
  subscriptionStatus?: "active" | "inactive" | "cancelled" | "past_due";
  subscriptionBuyDate?: Timestamp | Date | null; // Firestore Timestamp or JS Date
  subscriptionExpiryDate?: Timestamp | Date | null; // Firestore Timestamp or JS Date
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<UserProfile | null>;
  signInWithEmail: (email: string, password: string) => Promise<UserProfile | null>;
  signInWithGoogle: () => Promise<UserProfile | null>; 
  logout: () => Promise<void>;
  fetchUserProfile: (firebaseUser: User) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSideCheckComplete, setClientSideCheckComplete] = useState(false);
  const [currentPathname, setCurrentPathname] = useState('');

  const fetchUserProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
    if (!firebaseUser) return null;
    setLoading(true); // Set loading true when fetching profile
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      const existingData = userDocSnap.exists() ? userDocSnap.data() : {};
      
      // Prioritize Firebase Auth data for core fields, then Firestore, then defaults
      const profileDataToSet: Partial<UserProfile> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || existingData?.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL || existingData?.photoURL || null,
        lastLogin: serverTimestamp(),
        // Merge existing subscription data if present, otherwise initialize
        subscriptionPlan: existingData?.subscriptionPlan || "free",
        subscriptionStatus: existingData?.subscriptionStatus || "inactive",
        subscriptionBuyDate: existingData?.subscriptionBuyDate || null,
        subscriptionExpiryDate: existingData?.subscriptionExpiryDate || null,
      };

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, profileDataToSet);
      } else {
        await setDoc(userDocRef, { ...profileDataToSet, createdAt: serverTimestamp() });
      }
      const updatedProfile = { ...firebaseUser, ...profileDataToSet } as UserProfile;
      setUser(updatedProfile);
      return updatedProfile;
    } catch (e) {
      console.error("Error fetching/creating user profile in Firestore:", e);
      setError((e as Error).message);
      // Fallback to Firebase Auth user data if Firestore interaction fails
      const fallbackProfile = { 
        ...firebaseUser, 
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL,
        subscriptionPlan: "free", // Default subscription info on error
        subscriptionStatus: "inactive",
      } as UserProfile;
      setUser(fallbackProfile);
      return fallbackProfile;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPathname(window.location.pathname);
      setClientSideCheckComplete(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser); // await to ensure profile is loaded
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userProfileData: Partial<UserProfile> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        subscriptionPlan: "free",
        subscriptionStatus: "inactive",
        subscriptionBuyDate: null,
        subscriptionExpiryDate: null,
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);
      
      const fullUserProfile = { ...firebaseUser, ...userProfileData } as UserProfile;
      setUser(fullUserProfile);
      return fullUserProfile;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      return await fetchUserProfile(firebaseUser); // fetchUserProfile sets user and loading
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
      return null;
    }
  };

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      return await fetchUserProfile(firebaseUser); // fetchUserProfile sets user and loading
    } catch (e) {
      setError((e as Error).message);
      console.error("Google Sign-In Error:", e);
      setLoading(false);
      return null;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  if (loading && clientSideCheckComplete && currentPathname !== '/login' && currentPathname !== '/signup') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
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
