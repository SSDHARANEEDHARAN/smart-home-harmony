import { useEffect, useState, useRef } from 'react';
import { useHome } from '@/contexts/HomeContext';
import { useDevices } from '@/hooks/useDevices';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNotify } from '@/hooks/useNotify';
import {
  initNodeServer,
  destroyNodeServer,
  isNodeServerConnected,
  subscribeToNodeServerDeviceState,
  subscribeToNodeServerConnection,
  sendRelayCommand,
  reconnectNodeServer,
  type NodeServerConfig,
} from '@/services/nodeServerService';

export function useNodeServerSync() {
  const { currentHomeId, currentHome } = useHome();
  const { devices } = useDevices();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const { notifyHardwareTrigger } = useNotify();
  const lastKnownStates = useRef<Map<string, boolean>>(new Map());

  const platformConfig = currentHome?.platformConfig as Record<string, string> | undefined;
  const isNodeServer = platformConfig?.platform === 'node-server';
  const hasConfig = isNodeServer && !!platformConfig?.nodeServerHost;

  // Initialize / teardown WebSocket connection
  useEffect(() => {
    if (!hasConfig || !platformConfig) return;

    const config: NodeServerConfig = {
      host: platformConfig.nodeServerHost,
      port: platformConfig.nodeServerPort || '3000',
      protocol: platformConfig.nodeServerProtocol || 'http',
      wsUrl: platformConfig.nodeServerWsUrl,
      apiKey: platformConfig.nodeServerApiKey,
    };

    initNodeServer(currentHomeId, config);
    setIsConnected(isNodeServerConnected(currentHomeId));

    return () => {
      destroyNodeServer(currentHomeId);
      setIsConnected(false);
    };
  }, [currentHomeId, hasConfig, platformConfig?.nodeServerHost, platformConfig?.nodeServerPort]);

  // Subscribe to connection state
  useEffect(() => {
    if (!hasConfig) return;

    return subscribeToNodeServerConnection(currentHomeId, (_homeId, connected) => {
      setIsConnected(connected);
    });
  }, [currentHomeId, hasConfig]);

  // Initialize last known states
  useEffect(() => {
    devices.forEach(device => {
      if (!lastKnownStates.current.has(device.id)) {
        lastKnownStates.current.set(device.id, device.is_on);
      }
    });
  }, [devices]);

  // Subscribe to device state changes from WebSocket
  useEffect(() => {
    if (!hasConfig || !isConnected) return;

    return subscribeToNodeServerDeviceState(currentHomeId, async (deviceId, state) => {
      const device = devices.find(d => d.id === deviceId);
      if (!device) return;

      const newIsOn = state.is_on;
      if (typeof newIsOn !== 'boolean' || device.is_on === newIsOn) return;

      const previousState = lastKnownStates.current.get(deviceId) ?? device.is_on;

      console.log(`[NodeServer] Device ${device.name} changed to ${newIsOn} via WebSocket`);
      notifyHardwareTrigger(device.name, newIsOn);

      try {
        await supabase
          .from('devices')
          .update({ is_on: newIsOn })
          .eq('id', device.id);

        const { data: { user } } = await supabase.auth.getUser();
        if (user && device.relay_pin) {
          await supabase.from('relay_history').insert([{
            user_id: user.id,
            device_id: device.id,
            relay_pin: device.relay_pin,
            device_name: device.name,
            previous_state: previousState,
            new_state: newIsOn,
            source: 'node-server',
          }]);
        }

        lastKnownStates.current.set(deviceId, newIsOn);
        queryClient.invalidateQueries({ queryKey: ['devices'] });
        queryClient.invalidateQueries({ queryKey: ['relay-history'] });
      } catch (error) {
        console.error('[NodeServer] Failed to sync device state:', error);
      }
    });
  }, [currentHomeId, hasConfig, isConnected, devices, queryClient]);

  return {
    isConnected,
    hasNodeServerConfig: hasConfig,
    sendRelayCommand: (relayPin: number, state: boolean) =>
      sendRelayCommand(currentHomeId, relayPin, state),
    reconnect: () => reconnectNodeServer(currentHomeId),
  };
}
