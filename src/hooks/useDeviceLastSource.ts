import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DeviceLastSource {
  device_id: string;
  source: 'web' | 'hardware';
  triggered_at: string;
}

export function useDeviceLastSource() {
  const { user } = useAuth();

  const { data: lastSources = new Map<string, DeviceLastSource>() } = useQuery({
    queryKey: ['device-last-sources'],
    queryFn: async () => {
      // Get the most recent entry for each device
      const { data, error } = await supabase
        .from('relay_history')
        .select('device_id, source, triggered_at')
        .order('triggered_at', { ascending: false });
      
      if (error) throw error;
      
      // Create a map with the most recent entry for each device
      const sourceMap = new Map<string, DeviceLastSource>();
      data?.forEach(entry => {
        if (entry.device_id && !sourceMap.has(entry.device_id)) {
          sourceMap.set(entry.device_id, {
            device_id: entry.device_id,
            source: entry.source as 'web' | 'hardware',
            triggered_at: entry.triggered_at,
          });
        }
      });
      
      return sourceMap;
    },
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds for near real-time
  });

  const getLastSource = (deviceId: string): DeviceLastSource | undefined => {
    return lastSources.get(deviceId);
  };

  return {
    lastSources,
    getLastSource,
  };
}
