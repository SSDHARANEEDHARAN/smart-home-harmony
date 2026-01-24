import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FirebaseConfig } from '@/contexts/HomeContext';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

interface HomeConfig {
  id: string;
  user_id: string;
  home_id: string;
  name: string;
  firebase_config: FirebaseConfig | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useHomeConfigs() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: homeConfigs = [], isLoading } = useQuery({
    queryKey: ['home-configs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('home_configs')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as HomeConfig[];
    },
    enabled: !!user,
  });

  const upsertHomeConfig = useMutation({
    mutationFn: async ({
      homeId,
      name,
      firebaseConfig,
      position = 0,
    }: {
      homeId: string;
      name: string;
      firebaseConfig?: FirebaseConfig;
      position?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('home_configs')
        .upsert(
          [{
            user_id: user.id,
            home_id: homeId,
            name,
            firebase_config: firebaseConfig as any || null,
            position,
          }],
          { onConflict: 'user_id,home_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-configs'] });
    },
    onError: (error) => {
      toast.error('Failed to save home config: ' + error.message);
    },
  });

  const deleteHomeConfig = useMutation({
    mutationFn: async (homeId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('home_configs')
        .delete()
        .eq('user_id', user.id)
        .eq('home_id', homeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-configs'] });
    },
    onError: (error) => {
      toast.error('Failed to delete home config: ' + error.message);
    },
  });

  const updatePositions = useMutation({
    mutationFn: async (homes: { homeId: string; position: number }[]) => {
      if (!user) throw new Error('Not authenticated');

      const promises = homes.map(({ homeId, position }) =>
        supabase
          .from('home_configs')
          .update({ position })
          .eq('user_id', user.id)
          .eq('home_id', homeId)
      );

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-configs'] });
    },
  });

  return {
    homeConfigs,
    isLoading,
    upsertHomeConfig,
    deleteHomeConfig,
    updatePositions,
  };
}
