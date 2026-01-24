import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface RelayHistoryEntry {
  id: string;
  user_id: string;
  device_id: string | null;
  relay_pin: number | null;
  device_name: string | null;
  previous_state: boolean | null;
  new_state: boolean;
  source: 'web' | 'hardware';
  triggered_at: string;
}

export function useRelayHistory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['relay-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('relay_history')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as RelayHistoryEntry[];
    },
    enabled: !!user,
  });

  const logRelayChange = useMutation({
    mutationFn: async (entry: {
      device_id?: string;
      relay_pin?: number;
      device_name?: string;
      previous_state?: boolean;
      new_state: boolean;
      source: 'web' | 'hardware';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('relay_history')
        .insert([{
          user_id: user.id,
          device_id: entry.device_id || null,
          relay_pin: entry.relay_pin || null,
          device_name: entry.device_name || null,
          previous_state: entry.previous_state ?? null,
          new_state: entry.new_state,
          source: entry.source,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relay-history'] });
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('relay_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relay-history'] });
    },
  });

  return {
    history,
    isLoading,
    logRelayChange,
    clearHistory,
  };
}
