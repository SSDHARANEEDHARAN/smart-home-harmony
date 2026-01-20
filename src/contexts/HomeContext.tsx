import { createContext, useContext, useState, ReactNode } from 'react';

interface Home {
  id: string;
  name: string;
  icon: string;
}

interface HomeContextType {
  homes: Home[];
  currentHomeId: string;
  setCurrentHomeId: (id: string) => void;
  getHomeForRoom: (roomId: string) => string;
  addHome: (name: string, icon: string) => void;
}

const DEFAULT_HOMES: Home[] = [
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'office', name: 'Office', icon: '🏢' },
  { id: 'cabin', name: 'Cabin', icon: '🏡' },
];

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: ReactNode }) {
  const [homes, setHomes] = useState<Home[]>(DEFAULT_HOMES);
  const [currentHomeId, setCurrentHomeId] = useState('home');

  // For now, all rooms belong to 'home' - this can be extended with database
  const getHomeForRoom = (roomId: string) => {
    return 'home';
  };

  const addHome = (name: string, icon: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    setHomes(prev => [...prev, { id, name, icon }]);
  };

  return (
    <HomeContext.Provider value={{ homes, currentHomeId, setCurrentHomeId, getHomeForRoom, addHome }}>
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
