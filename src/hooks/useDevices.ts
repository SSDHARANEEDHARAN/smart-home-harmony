import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Device, DeviceType, ToggleStyle } from '@/types/smarthome';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { updateFirebaseRelay } from '@/services/firebaseService';
import { useHome } from '@/contexts/HomeContext';

export function useDevices() {
  const queryClient = useQueryClient();
  const { currentHomeId, currentHome } = useHome();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*, room:rooms(*)')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data.map(d => ({
        ...d,
        device_type: d.device_type as DeviceType,
        toggle_style: d.toggle_style as ToggleStyle,
      })) as Device[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('devices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['devices'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createDevice = useMutation({
    mutationFn: async (device: Omit<Device, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'room'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('devices')
        .insert({ ...device, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create device: ' + error.message);
    },
  });

  const updateDevice = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Device> & { id: string }) => {
      const { room, ...cleanUpdates } = updates;
      const { data, error } = await supabase
        .from('devices')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      toast.error('Failed to update device: ' + error.message);
    },
  });

  const toggleDevice = useMutation({
    mutationFn: async ({ id, is_on, relay_pin }: { id: string; is_on: boolean; relay_pin?: number | null }) => {
      // Get the device for previous state
      const device = devices.find(d => d.id === id);
      const previousState = device?.is_on ?? null;

      // Update the device state in database
      const { data, error } = await supabase
        .from('devices')
        .update({ is_on })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Log relay history for web UI changes (fire and forget - don't await)
      if (relay_pin) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.from('relay_history').insert([{
              user_id: user.id,
              device_id: id,
              relay_pin,
              device_name: data.name,
              previous_state: previousState,
              new_state: is_on,
              source: 'web',
            }]).then(() => {
              queryClient.invalidateQueries({ queryKey: ['relay-history'] });
            });
          }
        });
      }

      // Sync with Firebase RTDB if relay_pin is configured and home has Firebase config (fire and forget)
      if (relay_pin && currentHome?.firebaseConfig?.apiKey) {
        updateFirebaseRelay(currentHomeId, relay_pin, is_on).then(success => {
          if (success) console.log(`Firebase RTDB synced: relay${relay_pin} = ${is_on}`);
        }).catch(err => console.error('Firebase sync failed:', err));
      }

      // Trigger Supabase edge function relay if configured (fire and forget)
      if (relay_pin) {
        supabase.functions.invoke('trigger-relay', {
          body: { relay_pin, state: is_on },
        }).catch(err => console.error('Relay trigger failed:', err));
      }

      return data;
    },
    // Optimistic update - instant UI response
    onMutate: async ({ id, is_on }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['devices'] });

      // Snapshot previous value
      const previousDevices = queryClient.getQueryData<Device[]>(['devices']);

      // Optimistically update cache immediately
      queryClient.setQueryData<Device[]>(['devices'], (old) => 
        old?.map(device => 
          device.id === id ? { ...device, is_on } : device
        ) ?? []
      );

      // Return context with rollback value
      return { previousDevices };
    },
    onSuccess: (data) => {
      toast.success(`${data.name} turned ${data.is_on ? 'on' : 'off'}`);
    },
    onError: (error, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousDevices) {
        queryClient.setQueryData(['devices'], context.previousDevices);
      }
      toast.error('Failed to toggle device: ' + error.message);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  const deleteDevice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('devices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete device: ' + error.message);
    },
  });

  return {
    devices,
    isLoading,
    createDevice,
    updateDevice,
    toggleDevice,
    deleteDevice,
    isToggling: toggleDevice.isPending,
    togglingDeviceId: toggleDevice.isPending ? toggleDevice.variables?.id : null,
  };
}
