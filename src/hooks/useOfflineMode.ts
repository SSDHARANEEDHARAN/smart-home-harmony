import { useState, useCallback, useEffect } from 'react';
import { useHome } from '@/contexts/HomeContext';
import { toast } from 'sonner';

export interface OfflineModeConfig {
  enabled: boolean;
  deviceIp: string;
  isConnected: boolean;
  lastPing: Date | null;
}

const DEFAULT_DEVICE_IP = '192.168.1.15';
const PING_INTERVAL = 5000; // 5 seconds
const PING_TIMEOUT = 3000; // 3 seconds

export function useOfflineMode() {
  const { currentHomeId } = useHome();
  const [config, setConfig] = useState<OfflineModeConfig>(() => {
    const stored = localStorage.getItem(`offline-mode-${currentHomeId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {
          enabled: false,
          deviceIp: DEFAULT_DEVICE_IP,
          isConnected: false,
          lastPing: null,
        };
      }
    }
    return {
      enabled: false,
      deviceIp: DEFAULT_DEVICE_IP,
      isConnected: false,
      lastPing: null,
    };
  });

  // Persist config to localStorage
  useEffect(() => {
    localStorage.setItem(`offline-mode-${currentHomeId}`, JSON.stringify(config));
  }, [config, currentHomeId]);

  // Ping the device to check connectivity
  const pingDevice = useCallback(async (): Promise<boolean> => {
    if (!config.enabled) return false;
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT);
      
      // Try to reach the ESP32 device
      const response = await fetch(`http://${config.deviceIp}/ping`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors', // ESP32 might not support CORS
      });
      
      clearTimeout(timeout);
      
      setConfig(prev => ({
        ...prev,
        isConnected: true,
        lastPing: new Date(),
      }));
      
      return true;
    } catch (error) {
      setConfig(prev => ({
        ...prev,
        isConnected: false,
      }));
      return false;
    }
  }, [config.enabled, config.deviceIp]);

  // Enable offline mode
  const enableOfflineMode = useCallback((ip: string = DEFAULT_DEVICE_IP) => {
    setConfig(prev => ({
      ...prev,
      enabled: true,
      deviceIp: ip,
    }));
    toast.info(`Offline mode enabled. Connecting to ${ip}...`);
  }, []);

  // Disable offline mode
  const disableOfflineMode = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      enabled: false,
      isConnected: false,
    }));
    toast.info('Offline mode disabled. Switching to online mode.');
  }, []);

  // Update device IP
  const setDeviceIp = useCallback((ip: string) => {
    setConfig(prev => ({
      ...prev,
      deviceIp: ip,
      isConnected: false,
    }));
  }, []);

  // Send relay command in offline mode
  const sendOfflineCommand = useCallback(async (
    relayPin: number, 
    state: boolean
  ): Promise<boolean> => {
    if (!config.enabled || !config.deviceIp) {
      return false;
    }
    
    try {
      const response = await fetch(`http://${config.deviceIp}/relay/${relayPin}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state }),
        mode: 'no-cors',
      });
      
      return true;
    } catch (error) {
      console.error('Offline command failed:', error);
      toast.error('Failed to send command to device');
      return false;
    }
  }, [config.enabled, config.deviceIp]);

  // Get relay state in offline mode
  const getOfflineRelayState = useCallback(async (relayPin: number): Promise<boolean | null> => {
    if (!config.enabled || !config.deviceIp) {
      return null;
    }
    
    try {
      const response = await fetch(`http://${config.deviceIp}/relay/${relayPin}`, {
        method: 'GET',
        mode: 'no-cors',
      });
      
      // In no-cors mode, we can't read the response
      // The ESP32 should update the local state
      return null;
    } catch (error) {
      console.error('Failed to get relay state:', error);
      return null;
    }
  }, [config.enabled, config.deviceIp]);

  // Auto-ping when offline mode is enabled
  useEffect(() => {
    if (!config.enabled) return;
    
    // Initial ping
    pingDevice();
    
    // Set up interval
    const interval = setInterval(pingDevice, PING_INTERVAL);
    
    return () => clearInterval(interval);
  }, [config.enabled, pingDevice]);

  return {
    config,
    enableOfflineMode,
    disableOfflineMode,
    setDeviceIp,
    pingDevice,
    sendOfflineCommand,
    getOfflineRelayState,
    DEFAULT_DEVICE_IP,
  };
}
