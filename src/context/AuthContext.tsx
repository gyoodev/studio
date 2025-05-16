
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider, // Added
  signInWithPopup,    // Added
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'; // Added updateDoc
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface UserProfile extends User {
  displayName?: string | null;
  photoURL?: string | null; // Ensure photoURL is part of UserProfile
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<UserProfile | null>;
  signInWithEmail: (email: string, password: string) => Promise<UserProfile | null>;
  signInWithGoogle: () => Promise<UserProfile | null>; // Added
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
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      const profileDataToSet = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || userDocSnap.data()?.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL || userDocSnap.data()?.photoURL || null, // Capture Google photoURL
        lastLogin: serverTimestamp(),
      };

      if (userDocSnap.exists()) {
        // Update existing profile with latest info (especially photoURL from Google)
        await updateDoc(userDocRef, {
            ...profileDataToSet,
            displayName: profileDataToSet.displayName, // Ensure displayName is updated if it changed via Google
            photoURL: profileDataToSet.photoURL, // Ensure photoURL is updated
        });
        return { ...firebaseUser, ...userDocSnap.data(), ...profileDataToSet } as UserProfile;
      } else {
        // If user exists in Auth but not in Firestore, create a new profile doc
        await setDoc(userDocRef, { ...profileDataToSet, createdAt: serverTimestamp() });
        return { ...firebaseUser, ...profileDataToSet } as UserProfile;
      }
    } catch (e) {
      console.error("Error fetching/creating user profile in Firestore:", e);
      setError((e as Error).message);
      // Fallback to Firebase Auth user data if Firestore interaction fails
      return { 
        ...firebaseUser, 
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL 
      } as UserProfile;
    }
  };

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      setCurrentPathname(window.location.pathname);
      setClientSideCheckComplete(true); // Mark client-side check as complete
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array: runs once on mount and cleans up on unmount

  const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userProfileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);
      
      const fullUserProfile = { ...firebaseUser, ...userProfileData } as UserProfile;
      setUser(fullUserProfile);
      setLoading(false);
      return fullUserProfile;
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
      return null;
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const fullUserProfile = await fetchUserProfile(firebaseUser);
      setUser(fullUserProfile);
      setLoading(false);
      return fullUserProfile;
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
      // fetchUserProfile will create/update the Firestore document
      const fullUserProfile = await fetchUserProfile(firebaseUser); 
      setUser(fullUserProfile);
      setLoading(false);
      return fullUserProfile;
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

  // Conditional rendering of loader based on client-side checks
  if (loading && clientSideCheckComplete && currentPathname !== '/login' && currentPathname !== '/signup') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  // If not loading or on auth pages, or if client-side check is not complete (SSR), render children
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
