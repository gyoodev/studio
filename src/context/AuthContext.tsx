
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
import { auth, db } from '@/lib/firebase';
// import { Loader2 } from 'lucide-react'; // No longer needed here
import { Preloader } from '@/components/layout/Preloader'; // Import new Preloader

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

  const fetchUserProfile = async (firebaseUser: User, forceRefresh: boolean = false): Promise<UserProfile | null> => {
    if (!firebaseUser && !forceRefresh) return null;
    
    const targetUser = forceRefresh && auth.currentUser ? auth.currentUser : firebaseUser;
    if (!targetUser) {
        setLoading(false);
        return null;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', targetUser.uid);
      let userDocSnap = await getDoc(userDocRef); // Use let to allow re-assignment
      
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
          // Optionally re-fetch snapshot if other operations depend on the absolute latest
          // userDocSnap = await getDoc(userDocRef); 
          // existingData = userDocSnap.exists() ? userDocSnap.data() : {};
        }
      }
      
      const profileDataToSet: Partial<UserProfile> = {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.displayName || existingData?.displayName || targetUser.email?.split('@')[0],
        photoURL: targetUser.photoURL || existingData?.photoURL || null,
        lastLogin: serverTimestamp(),
        subscriptionPlan: existingData?.subscriptionPlan || "free",
        subscriptionStatus: existingData?.subscriptionStatus || "inactive",
        subscriptionBuyDate: existingData?.subscriptionBuyDate || null,
        subscriptionExpiryDate: existingData?.subscriptionExpiryDate || null,
      };
      
      if (!userDocSnap.exists()) { // Check if doc existed initially before potential expiry update
        profileDataToSet.createdAt = serverTimestamp(); // Set createdAt only for new users
        await setDoc(userDocRef, profileDataToSet, { merge: true }); // Use merge: true for safety
      } else {
        // For existing users, update relevant fields
        await updateDoc(userDocRef, {
           lastLogin: serverTimestamp(),
           displayName: profileDataToSet.displayName, 
           photoURL: profileDataToSet.photoURL, 
           email: profileDataToSet.email,
           // Only update subscription fields if they were part of an explicit update (like expiry)
           // This prevents overwriting valid subscription data if only displayName/photoURL changed via auth provider
           ...(existingData.subscriptionPlan !== profileDataToSet.subscriptionPlan && { subscriptionPlan: profileDataToSet.subscriptionPlan }),
           ...(existingData.subscriptionStatus !== profileDataToSet.subscriptionStatus && { subscriptionStatus: profileDataToSet.subscriptionStatus }),
        });
      }
      
      // Get the possibly updated snapshot again to ensure `createdAt` is correct for new users
      const finalUserDocSnap = await getDoc(userDocRef);
      const finalExistingData = finalUserDocSnap.exists() ? finalUserDocSnap.data() : {};

      const fullUserProfile = { 
        ...targetUser, // Base Firebase User properties
        ...(finalExistingData as Omit<UserProfile, keyof User>), // Firestore data (typed)
        // Explicitly ensure values from profileDataToSet are prioritized if they were calculated/updated
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
        displayName: targetUser.displayName || targetUser.email?.split('@')[0],
        photoURL: targetUser.photoURL,
        subscriptionPlan: "free",
        subscriptionStatus: "inactive",
      } as UserProfile;
      setUser(fallbackProfile); // Set a basic profile even on error
      return fallbackProfile;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPathname(window.location.pathname);
    }
    setClientSideCheckComplete(true); 

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser);
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
      return await fetchUserProfile(firebaseUser);
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
      return await fetchUserProfile(firebaseUser); 
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
  
  const showGlobalLoader = clientSideCheckComplete && loading && currentPathname !== '/login' && currentPathname !== '/signup';

  if (showGlobalLoader) {
    return <Preloader />; // Use the new Preloader component
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
