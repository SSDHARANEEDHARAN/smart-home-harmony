import { initializeApp, FirebaseApp, deleteApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, Database, Unsubscribe } from 'firebase/database';
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

export interface FirebaseInstance {
  app: FirebaseApp;
  db: Database;
  auth: Auth;
  authenticated: boolean;
  connected: boolean;
}

export type RelayStateCallback = (relayPin: number, state: boolean) => void;
export type ConnectionStateCallback = (homeId: string, connected: boolean) => void;

// Store Firebase instances per home
const firebaseInstances: Map<string, FirebaseInstance> = new Map();
const relayListeners: Map<string, Unsubscribe[]> = new Map();
const connectionListeners: Map<string, ConnectionStateCallback[]> = new Map();
const relayCallbacks: Map<string, RelayStateCallback[]> = new Map();

export async function initializeFirebaseForHome(
  homeId: string,
  config: FirebaseConfig,
  email?: string,
  password?: string
): Promise<FirebaseInstance | null> {
  if (!config.apiKey || !config.databaseURL) {
    console.warn('Firebase config missing required fields');
    notifyConnectionChange(homeId, false);
    return null;
  }

  try {
    // Check if instance exists and clean up
    cleanupFirebaseInstance(homeId);

    // Initialize new Firebase app with unique name
    const appName = `home-${homeId}`;
    const app = initializeApp(config, appName);
    const db = getDatabase(app);
    const auth = getAuth(app);

    let authenticated = false;
    let connected = false;

    // Authenticate if credentials provided
    if (email && password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        authenticated = true;
        connected = true;
        console.log('Firebase authenticated for home:', homeId);
      } catch (authError) {
        console.error('Firebase auth failed:', authError);
      }
    } else {
      // No auth required, consider connected if config is valid
      connected = true;
    }

    const instance: FirebaseInstance = { app, db, auth, authenticated, connected };
    firebaseInstances.set(homeId, instance);
    
    // Set up connection state listener
    setupConnectionListener(homeId, db);
    
    // Notify listeners
    notifyConnectionChange(homeId, connected);
    
    return instance;
  } catch (error) {
    console.error('Failed to initialize Firebase for home:', homeId, error);
    notifyConnectionChange(homeId, false);
    return null;
  }
}

function setupConnectionListener(homeId: string, db: Database) {
  const connectedRef = ref(db, '.info/connected');
  const unsubscribe = onValue(connectedRef, (snapshot) => {
    const connected = snapshot.val() === true;
    const instance = firebaseInstances.get(homeId);
    if (instance) {
      instance.connected = connected;
    }
    notifyConnectionChange(homeId, connected);
  });
  
  // Store the unsubscribe function
  const existing = relayListeners.get(homeId) || [];
  relayListeners.set(homeId, [...existing, unsubscribe]);
}

function notifyConnectionChange(homeId: string, connected: boolean) {
  const callbacks = connectionListeners.get(homeId) || [];
  callbacks.forEach(cb => cb(homeId, connected));
  
  // Also notify global listeners
  const globalCallbacks = connectionListeners.get('*') || [];
  globalCallbacks.forEach(cb => cb(homeId, connected));
}

export function subscribeToConnectionState(
  homeId: string | '*',
  callback: ConnectionStateCallback
): () => void {
  const existing = connectionListeners.get(homeId) || [];
  connectionListeners.set(homeId, [...existing, callback]);
  
  // Return unsubscribe function
  return () => {
    const callbacks = connectionListeners.get(homeId) || [];
    connectionListeners.set(homeId, callbacks.filter(cb => cb !== callback));
  };
}

export function getFirebaseInstance(homeId: string): FirebaseInstance | undefined {
  return firebaseInstances.get(homeId);
}

export function isFirebaseConnected(homeId: string): boolean {
  const instance = firebaseInstances.get(homeId);
  return instance?.connected ?? false;
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

export function subscribeToRelayChanges(
  homeId: string,
  relayPins: number[],
  callback: RelayStateCallback
): () => void {
  const instance = firebaseInstances.get(homeId);
  
  if (!instance) {
    console.warn('No Firebase instance for home:', homeId);
    return () => {};
  }

  const unsubscribes: Unsubscribe[] = [];
  
  relayPins.forEach(pin => {
    const relayRef = ref(instance.db, `/relay${pin}`);
    const unsubscribe = onValue(relayRef, (snapshot) => {
      const state = snapshot.val();
      if (typeof state === 'boolean') {
        callback(pin, state);
      }
    });
    unsubscribes.push(unsubscribe);
  });

  // Store callbacks for this home
  const existingCallbacks = relayCallbacks.get(homeId) || [];
  relayCallbacks.set(homeId, [...existingCallbacks, callback]);

  // Return unsubscribe function
  return () => {
    unsubscribes.forEach(unsub => unsub());
    const callbacks = relayCallbacks.get(homeId) || [];
    relayCallbacks.set(homeId, callbacks.filter(cb => cb !== callback));
  };
}

export function cleanupFirebaseInstance(homeId: string): void {
  // Clean up listeners
  const listeners = relayListeners.get(homeId);
  if (listeners) {
    listeners.forEach(unsub => unsub());
    relayListeners.delete(homeId);
  }
  
  // Clean up the instance
  const instance = firebaseInstances.get(homeId);
  if (instance) {
    try {
      deleteApp(instance.app);
    } catch (e) {
      // Ignore cleanup errors
    }
    firebaseInstances.delete(homeId);
  }
  
  // Notify disconnection
  notifyConnectionChange(homeId, false);
}

export function getAllConnectedHomes(): string[] {
  const connected: string[] = [];
  firebaseInstances.forEach((instance, homeId) => {
    if (instance.connected) {
      connected.push(homeId);
    }
  });
  return connected;
}
