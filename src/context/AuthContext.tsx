
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface UserProfile extends User {
  displayName?: string | null; // Ensure displayName is part of our extended UserProfile
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<UserProfile | null>;
  signInWithEmail: (email: string, password: string) => Promise<UserProfile | null>;
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
      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data();
        return {
          ...firebaseUser,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: profileData.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          // photoURL: profileData.photoURL || firebaseUser.photoURL, // Add if you store custom photoURL
        };
      } else {
        const newUserProfile: Pick<UserProfile, 'uid' | 'email' | 'displayName'> & { createdAt: any } = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newUserProfile);
        return { ...firebaseUser, ...newUserProfile } as UserProfile;
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
      setError((e as Error).message);
      return { ...firebaseUser, displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] } as UserProfile; // Fallback
    }
  };

  useEffect(() => {
    // This effect runs only on the client after the initial mount.
    setCurrentPathname(window.location.pathname);
    setClientSideCheckComplete(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // setLoading(true); // setLoading is already true initially or set by other operations.
        const userProfile = await fetchUserProfile(firebaseUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false); // Auth state is now resolved.
    });
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs once on mount (client-side).

  const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userProfileData: Pick<UserProfile, 'uid' | 'email' | 'displayName'> & { createdAt: any } = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || firebaseUser.email?.split('@')[0],
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);
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

  // Conditional rendering for the global loader:
  // Show loader if auth is still loading, client-side checks are complete, and not on login/signup page.
  if (loading && clientSideCheckComplete && currentPathname !== '/login' && currentPathname !== '/signup') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Default render:
  // - On server-side (clientSideCheckComplete is false)
  // - On initial client-side render before useEffect runs (clientSideCheckComplete is false)
  // - When loading is false (auth state resolved)
  // - When on /login or /signup pages (even if loading and clientSideCheckComplete are true)
  return (
    <AuthContext.Provider value={{ user, loading, error, signUpWithEmail, signInWithEmail, logout, fetchUserProfile }}>
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
