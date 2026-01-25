import { useState, useCallback, useEffect } from 'react';
import { useHome } from '@/contexts/HomeContext';
import { toast } from 'sonner';

export interface DiscoveredDevice {
  ip: string;
  name: string;
  lastSeen: Date;
}

export interface OfflineModeConfig {
  enabled: boolean;
  deviceIp: string;
  isConnected: boolean;
  lastPing: Date | null;
  signalStrength: number; // 0-100
}

const DEFAULT_DEVICE_IP = '192.168.1.15';
const PING_INTERVAL = 5000; // 5 seconds
const PING_TIMEOUT = 3000; // 3 seconds
const SCAN_TIMEOUT = 2000; // 2 seconds per IP

export function useOfflineMode() {
  const { currentHomeId } = useHome();
  const [config, setConfig] = useState<OfflineModeConfig>(() => {
    const stored = localStorage.getItem(`offline-mode-${currentHomeId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...parsed, signalStrength: parsed.signalStrength || 0 };
      } catch {
        return {
          enabled: false,
          deviceIp: DEFAULT_DEVICE_IP,
          isConnected: false,
          lastPing: null,
          signalStrength: 0,
        };
      }
    }
    return {
      enabled: false,
      deviceIp: DEFAULT_DEVICE_IP,
      isConnected: false,
      lastPing: null,
      signalStrength: 0,
    };
  });
  
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Persist config to localStorage
  useEffect(() => {
    localStorage.setItem(`offline-mode-${currentHomeId}`, JSON.stringify(config));
  }, [config, currentHomeId]);

  // Simulate signal strength based on response time
  const calculateSignalStrength = (responseTime: number): number => {
    // responseTime in ms - lower is better
    if (responseTime < 50) return 100;
    if (responseTime < 100) return 90;
    if (responseTime < 200) return 75;
    if (responseTime < 500) return 60;
    if (responseTime < 1000) return 40;
    if (responseTime < 2000) return 20;
    return 10;
  };

  // Ping the device to check connectivity
  const pingDevice = useCallback(async (): Promise<boolean> => {
    if (!config.enabled) return false;
    
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT);
      
      // Try to reach the ESP32 device
      await fetch(`http://${config.deviceIp}/ping`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors', // ESP32 might not support CORS
      });
      
      clearTimeout(timeout);
      
      const responseTime = Date.now() - startTime;
      const signalStrength = calculateSignalStrength(responseTime);
      
      setConfig(prev => ({
        ...prev,
        isConnected: true,
        lastPing: new Date(),
        signalStrength,
      }));
      
      return true;
    } catch (error) {
      setConfig(prev => ({
        ...prev,
        isConnected: false,
        signalStrength: 0,
      }));
      return false;
    }
  }, [config.enabled, config.deviceIp]);

  // Scan a single IP for ESP32 device
  const scanIp = async (ip: string): Promise<DiscoveredDevice | null> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SCAN_TIMEOUT);
      
      await fetch(`http://${ip}/ping`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors',
      });
      
      clearTimeout(timeout);
      
      // Device responded
      return {
        ip,
        name: `ESP32 (${ip})`,
        lastSeen: new Date(),
      };
    } catch {
      return null;
    }
  };

  // Scan local network for ESP32 devices
  const scanNetwork = useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);
    setDiscoveredDevices([]);
    
    const devices: DiscoveredDevice[] = [];
    const subnet = config.deviceIp.split('.').slice(0, 3).join('.');
    
    // Scan common IP ranges (1-50 for faster results)
    const scanRange = 50;
    const batchSize = 10;
    
    for (let i = 1; i <= scanRange; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, scanRange + 1); j++) {
        batch.push(scanIp(`${subnet}.${j}`));
      }
      
      const results = await Promise.all(batch);
      results.forEach(device => {
        if (device) {
          devices.push(device);
          setDiscoveredDevices(prev => [...prev, device]);
        }
      });
      
      setScanProgress(Math.round((Math.min(i + batchSize, scanRange) / scanRange) * 100));
    }
    
    setIsScanning(false);
    
    if (devices.length === 0) {
      toast.info('No ESP32 devices found on local network');
    } else {
      toast.success(`Found ${devices.length} device(s)`);
    }
    
    return devices;
  }, [config.deviceIp]);

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
      signalStrength: 0,
    }));
    toast.info('Offline mode disabled. Switching to online mode.');
  }, []);

  // Update device IP
  const setDeviceIp = useCallback((ip: string) => {
    setConfig(prev => ({
      ...prev,
      deviceIp: ip,
      isConnected: false,
      signalStrength: 0,
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
      await fetch(`http://${config.deviceIp}/relay/${relayPin}`, {
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
      await fetch(`http://${config.deviceIp}/relay/${relayPin}`, {
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
    scanNetwork,
    discoveredDevices,
    isScanning,
    scanProgress,
    DEFAULT_DEVICE_IP,
  };
}
