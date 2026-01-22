import { useEffect, useRef } from 'react';
import { Device } from '@/types/smarthome';
import { toast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { playNotificationSound, SoundType } from '@/utils/sound';

export function useDeviceNotifications(devices: Device[]) {
  const previousDevicesRef = useRef<Map<string, boolean>>(new Map());
  const isInitializedRef = useRef(false);
  const { settings } = useSettings();

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
        // Only show notification if device state changes setting is enabled
        if (settings.notifications.deviceStateChanges) {
          toast({
            title: device.is_on ? '🟢 Device Turned On' : '🔴 Device Turned Off',
            description: `${device.name} is now ${device.is_on ? 'on' : 'off'}`,
          });
          
          // Play sound if sound effects are enabled
          if (settings.notifications.soundEnabled) {
            playNotificationSound(settings.notifications.soundType as SoundType);
          }
        }
      }
      
      previousDevicesRef.current.set(device.id, device.is_on);
    });
  }, [devices, settings.notifications]);
}
