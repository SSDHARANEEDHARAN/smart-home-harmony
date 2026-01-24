import { initializeApp, FirebaseApp, getApps, deleteApp } from 'firebase/app';
import { getDatabase, ref, set, Database } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, Auth } from 'firebase/auth';

interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  databaseURL?: string;
}

interface FirebaseInstance {
  app: FirebaseApp;
  db: Database;
  auth: Auth;
  authenticated: boolean;
}

// Store Firebase instances per home
const firebaseInstances: Map<string, FirebaseInstance> = new Map();

export async function initializeFirebaseForHome(
  homeId: string,
  config: FirebaseConfig,
  email?: string,
  password?: string
): Promise<FirebaseInstance | null> {
  if (!config.apiKey || !config.databaseURL) {
    console.warn('Firebase config missing required fields');
    return null;
  }

  try {
    // Check if instance exists and clean up
    const existing = firebaseInstances.get(homeId);
    if (existing) {
      try {
        await deleteApp(existing.app);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Initialize new Firebase app with unique name
    const appName = `home-${homeId}`;
    const app = initializeApp(config, appName);
    const db = getDatabase(app);
    const auth = getAuth(app);

    let authenticated = false;

    // Authenticate if credentials provided
    if (email && password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        authenticated = true;
        console.log('Firebase authenticated for home:', homeId);
      } catch (authError) {
        console.error('Firebase auth failed:', authError);
      }
    }

    const instance: FirebaseInstance = { app, db, auth, authenticated };
    firebaseInstances.set(homeId, instance);
    
    return instance;
  } catch (error) {
    console.error('Failed to initialize Firebase for home:', homeId, error);
    return null;
  }
}

export function getFirebaseInstance(homeId: string): FirebaseInstance | undefined {
  return firebaseInstances.get(homeId);
}

export async function updateFirebaseRelay(
  homeId: string,
  relayPin: number,
  state: boolean
): Promise<boolean> {
  const instance = firebaseInstances.get(homeId);
  
  if (!instance) {
    console.warn('No Firebase instance for home:', homeId);
    return false;
  }

  try {
    // Write to Firebase RTDB at /relay{pin} path
    const relayRef = ref(instance.db, `/relay${relayPin}`);
    await set(relayRef, state);
    console.log(`Firebase RTDB updated: /relay${relayPin} = ${state}`);
    return true;
  } catch (error) {
    console.error('Failed to update Firebase relay:', error);
    return false;
  }
}

export function cleanupFirebaseInstance(homeId: string): void {
  const instance = firebaseInstances.get(homeId);
  if (instance) {
    try {
      deleteApp(instance.app);
    } catch (e) {
      // Ignore cleanup errors
    }
    firebaseInstances.delete(homeId);
  }
}
