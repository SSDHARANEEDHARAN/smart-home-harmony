import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { initializeFirebaseForHome, cleanupFirebaseInstance } from '@/services/firebaseService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  databaseURL?: string;
  authEmail?: string;
  authPassword?: string;
}

export interface Home {
  id: string;
  name: string;
  firebaseConfig?: FirebaseConfig;
  platformConfig?: Record<string, any>;
  position?: number;
}

interface HomeContextType {
  homes: Home[];
  currentHomeId: string;
  currentHome: Home | undefined;
  setCurrentHomeId: (id: string) => void;
  getHomeForRoom: (roomId: string) => string;
  addHome: (name: string, firebaseConfig?: FirebaseConfig, platformConfig?: Record<string, any>) => void;
  deleteHome: (id: string) => void;
  updateHome: (id: string, name: string, firebaseConfig?: FirebaseConfig, platformConfig?: Record<string, any>) => void;
  reorderHomes: (newOrder: Home[]) => void;
  isLoading: boolean;
}

const DEFAULT_HOMES: Home[] = [
  { id: 'home', name: 'Home', position: 0 },
];

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [homes, setHomes] = useState<Home[]>(DEFAULT_HOMES);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentHomeId, setCurrentHomeId] = useState(() => {
    const stored = localStorage.getItem('smarthome-current-home');
    return stored || 'home';
  });

  const currentHome = homes.find(h => h.id === currentHomeId) || homes[0];

  // Fetch homes from database when user is authenticated
  const fetchHomes = useCallback(async () => {
    if (!user) {
      setHomes(DEFAULT_HOMES);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('home_configs')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedHomes: Home[] = data.map((config: any) => ({
          id: config.home_id,
          name: config.name,
          firebaseConfig: config.firebase_config || undefined,
          platformConfig: config.platform_config || undefined,
          position: config.position,
        }));
        setHomes(loadedHomes);
        
        // Set current home to first if current doesn't exist
        if (!loadedHomes.find(h => h.id === currentHomeId)) {
          setCurrentHomeId(loadedHomes[0].id);
        }
      } else {
        // Create default home for new user
        await supabase.from('home_configs').insert([{
          user_id: user.id,
          home_id: 'home',
          name: 'Home',
          position: 0,
        }]);
        setHomes(DEFAULT_HOMES);
      }
    } catch (error) {
      console.error('Failed to fetch homes:', error);
      setHomes(DEFAULT_HOMES);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHomeId]);

  useEffect(() => {
    if (!authLoading) {
      fetchHomes();
    }
  }, [authLoading, fetchHomes]);

  // Persist current home selection
  useEffect(() => {
    localStorage.setItem('smarthome-current-home', currentHomeId);
  }, [currentHomeId]);

  // Initialize Firebase for homes with config
  useEffect(() => {
    homes.forEach(home => {
      if (home.firebaseConfig?.apiKey && home.firebaseConfig?.databaseURL) {
        initializeFirebaseForHome(
          home.id,
          home.firebaseConfig,
          home.firebaseConfig.authEmail,
          home.firebaseConfig.authPassword
        );
      }
    });
  }, [homes]);

  const getHomeForRoom = (roomId: string) => {
    return currentHomeId;
  };

  const addHome = async (name: string, firebaseConfig?: FirebaseConfig, platformConfig?: Record<string, any>) => {
    const id = `home-${Date.now()}`;
    const position = homes.length;

    if (user) {
      try {
        await supabase.from('home_configs').insert([{
          user_id: user.id,
          home_id: id,
          name,
          firebase_config: firebaseConfig as any || null,
          platform_config: platformConfig as any || null,
          position,
        }]);
      } catch (error) {
        console.error('Failed to save home:', error);
      }
    }

    setHomes(prev => [...prev, { id, name, firebaseConfig, platformConfig, position }]);
    toast.success(`Created "${name}" workspace`);
  };

  const deleteHome = async (id: string) => {
    const home = homes.find(h => h.id === id);
    cleanupFirebaseInstance(id);

    if (user) {
      try {
        await supabase
          .from('home_configs')
          .delete()
          .eq('home_id', id);
      } catch (error) {
        console.error('Failed to delete home:', error);
      }
    }

    setHomes(prev => prev.filter(h => h.id !== id));
    
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

  const updateHome = async (id: string, name: string, firebaseConfig?: FirebaseConfig, platformConfig?: Record<string, any>) => {
    // Reinitialize Firebase if config changed
    if (firebaseConfig?.apiKey && firebaseConfig?.databaseURL) {
      initializeFirebaseForHome(
        id,
        firebaseConfig,
        firebaseConfig.authEmail,
        firebaseConfig.authPassword
      );
    } else {
      cleanupFirebaseInstance(id);
    }

    const home = homes.find(h => h.id === id);

    if (user) {
      try {
        await supabase
          .from('home_configs')
          .upsert([{
            user_id: user.id,
            home_id: id,
            name,
            firebase_config: firebaseConfig as any || null,
            platform_config: platformConfig as any || null,
            position: home?.position || 0,
          }], { onConflict: 'user_id,home_id' });
      } catch (error) {
        console.error('Failed to update home:', error);
      }
    }

    setHomes(prev => prev.map(h => 
      h.id === id ? { ...h, name, firebaseConfig, platformConfig } : h
    ));
    toast.success(`Saved "${name}" settings`);
  };

  const reorderHomes = async (newOrder: Home[]) => {
    setHomes(newOrder);

    if (user) {
      try {
        const updates = newOrder.map((home, index) => 
          supabase
            .from('home_configs')
            .update({ position: index })
            .eq('home_id', home.id)
        );
        await Promise.all(updates);
      } catch (error) {
        console.error('Failed to update positions:', error);
      }
    }
  };

  return (
    <HomeContext.Provider value={{ 
      homes, 
      currentHomeId,
      currentHome,
      setCurrentHomeId, 
      getHomeForRoom, 
      addHome,
      deleteHome,
      updateHome,
      reorderHomes,
      isLoading,
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
