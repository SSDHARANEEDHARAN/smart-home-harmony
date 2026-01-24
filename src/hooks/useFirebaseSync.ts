import { useEffect, useState, useCallback } from 'react';
import { useHome } from '@/contexts/HomeContext';
import { useDevices } from '@/hooks/useDevices';
import { 
  subscribeToRelayChanges, 
  subscribeToConnectionState,
  isFirebaseConnected,
  getFirebaseInstance 
} from '@/services/firebaseService';
import { supabase } from '@/integrations/supabase/client';

export function useFirebaseSync() {
  const { currentHomeId, currentHome } = useHome();
  const { devices } = useDevices();
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check connection status
  useEffect(() => {
    const instance = getFirebaseInstance(currentHomeId);
    setIsConnected(instance?.connected ?? false);
    setIsAuthenticated(instance?.authenticated ?? false);

    const unsubscribe = subscribeToConnectionState(currentHomeId, (homeId, connected) => {
      if (homeId === currentHomeId) {
        setIsConnected(connected);
        const inst = getFirebaseInstance(homeId);
        setIsAuthenticated(inst?.authenticated ?? false);
      }
    });

    return unsubscribe;
  }, [currentHomeId]);

  // Subscribe to relay changes from Firebase and sync to Supabase
  useEffect(() => {
    if (!currentHome?.firebaseConfig?.apiKey || !isConnected) {
      return;
    }

    // Get all devices with relay pins
    const devicesWithRelays = devices.filter(d => d.relay_pin);
    const relayPins = devicesWithRelays.map(d => d.relay_pin!);

    if (relayPins.length === 0) {
      return;
    }

    const unsubscribe = subscribeToRelayChanges(
      currentHomeId,
      relayPins,
      async (relayPin, state) => {
        // Find device with this relay pin
        const device = devicesWithRelays.find(d => d.relay_pin === relayPin);
        
        if (device && device.is_on !== state) {
          console.log(`Firebase sync: relay${relayPin} changed to ${state}, updating device ${device.name}`);
          
          // Update device in Supabase (this will trigger React Query invalidation)
          try {
            await supabase
              .from('devices')
              .update({ is_on: state })
              .eq('id', device.id);
          } catch (error) {
            console.error('Failed to sync device state from Firebase:', error);
          }
        }
      }
    );

    return unsubscribe;
  }, [currentHomeId, currentHome, devices, isConnected]);

  return {
    isConnected,
    isAuthenticated,
    hasFirebaseConfig: !!(currentHome?.firebaseConfig?.apiKey && currentHome?.firebaseConfig?.databaseURL),
  };
}

export function useFirebaseConnectionStatus(homeId?: string) {
  const { currentHomeId } = useHome();
  const targetHomeId = homeId || currentHomeId;
  const [isConnected, setIsConnected] = useState(() => isFirebaseConnected(targetHomeId));

  useEffect(() => {
    setIsConnected(isFirebaseConnected(targetHomeId));

    const unsubscribe = subscribeToConnectionState(targetHomeId, (id, connected) => {
      if (id === targetHomeId) {
        setIsConnected(connected);
      }
    });

    return unsubscribe;
  }, [targetHomeId]);

  return isConnected;
}
