import { useEffect, useRef } from 'react';
import { Device } from '@/types/smarthome';
import { toast } from '@/hooks/use-toast';

export function useDeviceNotifications(devices: Device[]) {
  const previousDevicesRef = useRef<Map<string, boolean>>(new Map());
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Skip the first render to avoid notifications on initial load
    if (!isInitializedRef.current) {
      devices.forEach(device => {
        previousDevicesRef.current.set(device.id, device.is_on);
      });
      isInitializedRef.current = true;
      return;
    }

    // Check for state changes
    devices.forEach(device => {
      const previousState = previousDevicesRef.current.get(device.id);
      
      if (previousState !== undefined && previousState !== device.is_on) {
        toast({
          title: device.is_on ? '🟢 Device Turned On' : '🔴 Device Turned Off',
          description: `${device.name} is now ${device.is_on ? 'on' : 'off'}`,
        });
      }
      
      previousDevicesRef.current.set(device.id, device.is_on);
    });
  }, [devices]);
}
