import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

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

interface Home {
  id: string;
  name: string;
  firebaseConfig?: FirebaseConfig;
}

interface HomeContextType {
  homes: Home[];
  currentHomeId: string;
  setCurrentHomeId: (id: string) => void;
  getHomeForRoom: (roomId: string) => string;
  addHome: (name: string, firebaseConfig?: FirebaseConfig) => void;
  deleteHome: (id: string) => void;
  updateHome: (id: string, name: string, firebaseConfig?: FirebaseConfig) => void;
}

const STORAGE_KEY = 'smarthome-homes';

const DEFAULT_HOMES: Home[] = [
  { id: 'home', name: 'Home' },
];

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: ReactNode }) {
  const [homes, setHomes] = useState<Home[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_HOMES;
      }
    }
    return DEFAULT_HOMES;
  });
  
  const [currentHomeId, setCurrentHomeId] = useState(() => {
    const stored = localStorage.getItem('smarthome-current-home');
    return stored || 'home';
  });

  // Persist homes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(homes));
  }, [homes]);

  // Persist current home selection
  useEffect(() => {
    localStorage.setItem('smarthome-current-home', currentHomeId);
  }, [currentHomeId]);

  // For now, all rooms belong to 'home' - this can be extended with database
  const getHomeForRoom = (roomId: string) => {
    return 'home';
  };

  const addHome = (name: string, firebaseConfig?: FirebaseConfig) => {
    const id = `home-${Date.now()}`;
    setHomes(prev => [...prev, { id, name, firebaseConfig }]);
    toast.success(`Created "${name}" workspace`);
  };

  const deleteHome = (id: string) => {
    const home = homes.find(h => h.id === id);
    setHomes(prev => prev.filter(h => h.id !== id));
    
    // Switch to first available home if current was deleted
    if (currentHomeId === id) {
      const remaining = homes.filter(h => h.id !== id);
      if (remaining.length > 0) {
        setCurrentHomeId(remaining[0].id);
      }
    }
    
    if (home) {
      toast.success(`Deleted "${home.name}" workspace`);
    }
  };

  const updateHome = (id: string, name: string, firebaseConfig?: FirebaseConfig) => {
    setHomes(prev => prev.map(h => 
      h.id === id ? { ...h, name, firebaseConfig } : h
    ));
    toast.success(`Updated "${name}" workspace`);
  };

  return (
    <HomeContext.Provider value={{ 
      homes, 
      currentHomeId, 
      setCurrentHomeId, 
      getHomeForRoom, 
      addHome,
      deleteHome,
      updateHome,
    }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
}
