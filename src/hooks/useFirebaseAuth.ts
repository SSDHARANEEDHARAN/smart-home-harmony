import { useState, useEffect, useCallback } from 'react';
import { initializeApp, FirebaseApp, deleteApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';

// Default Firebase config for trial purposes
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCXukRomjz0TOqhT2M5P-qa8F9DK5R-f2U",
  authDomain: "iot-home-main.firebaseapp.com",
  databaseURL: "https://iot-home-main-default-rtdb.firebaseio.com",
  projectId: "iot-home-main",
  storageBucket: "iot-home-main.firebasestorage.app",
  messagingSenderId: "458182875538",
  appId: "1:458182875538:web:881019dc7d9bd733e1894b",
  measurementId: "G-JKBZ0BYNC9"
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function getFirebaseAuth(): Auth {
  if (!firebaseApp) {
    firebaseApp = initializeApp(DEFAULT_FIREBASE_CONFIG, 'auth-app');
  }
  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp);
  }
  return firebaseAuth;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }, []);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
