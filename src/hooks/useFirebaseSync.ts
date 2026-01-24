import { useEffect, useState, useRef } from 'react';
import { useHome } from '@/contexts/HomeContext';
import { useDevices } from '@/hooks/useDevices';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Track last known states to detect hardware changes
  const lastKnownStates = useRef<Map<number, boolean>>(new Map());

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

  // Initialize last known states from devices
  useEffect(() => {
    devices.forEach(device => {
      if (device.relay_pin && !lastKnownStates.current.has(device.relay_pin)) {
        lastKnownStates.current.set(device.relay_pin, device.is_on);
      }
    });
  }, [devices]);

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
          const previousState = lastKnownStates.current.get(relayPin) ?? device.is_on;
          
          console.log(`Firebase sync: relay${relayPin} changed to ${state} (hardware), updating device ${device.name}`);
          
          // Update device in Supabase
          try {
            await supabase
              .from('devices')
              .update({ is_on: state })
              .eq('id', device.id);
            
            // Log as hardware change
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('relay_history').insert([{
                user_id: user.id,
                device_id: device.id,
                relay_pin: relayPin,
                device_name: device.name,
                previous_state: previousState,
                new_state: state,
                source: 'hardware',
              }]);
            }

            // Update last known state
            lastKnownStates.current.set(relayPin, state);
            
            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['devices'] });
            queryClient.invalidateQueries({ queryKey: ['relay-history'] });
          } catch (error) {
            console.error('Failed to sync device state from Firebase:', error);
          }
        }
      }
    );

    return unsubscribe;
  }, [currentHomeId, currentHome, devices, isConnected, queryClient]);

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
