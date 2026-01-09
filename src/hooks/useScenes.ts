import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface DeviceState {
  device_id: string;
  is_on: boolean;
  brightness?: number;
}

export interface Scene {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  description: string | null;
  device_states: DeviceState[];
  created_at: string;
  updated_at: string;
}

export function useScenes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: scenes = [], isLoading } = useQuery({
    queryKey: ['scenes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(scene => ({
        ...scene,
        device_states: Array.isArray(scene.device_states) 
          ? (scene.device_states as unknown as DeviceState[])
          : []
      })) as Scene[];
    },
    enabled: !!user,
  });

  const createScene = useMutation({
    mutationFn: async (scene: Omit<Scene, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('scenes')
        .insert({
          name: scene.name,
          icon: scene.icon,
          description: scene.description,
          device_states: scene.device_states as unknown as Json,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
      toast({ title: 'Scene created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create scene', description: error.message, variant: 'destructive' });
    },
  });

  const activateScene = useMutation({
    mutationFn: async (scene: Scene) => {
      if (!user) throw new Error('Not authenticated');
      
      // Update all devices in the scene
      for (const state of scene.device_states) {
        await supabase
          .from('devices')
          .update({ 
            is_on: state.is_on,
            brightness: state.brightness 
          })
          .eq('id', state.device_id)
          .eq('user_id', user.id);
      }
      
      return scene;
    },
    onSuccess: (scene) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast({ 
        title: `${scene.name} activated`,
        description: `${scene.device_states.length} devices updated`
      });
    },
    onError: (error) => {
      toast({ title: 'Failed to activate scene', description: error.message, variant: 'destructive' });
    },
  });

  const deleteScene = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scenes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
      toast({ title: 'Scene deleted' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete scene', description: error.message, variant: 'destructive' });
    },
  });

  return {
    scenes,
    isLoading,
    createScene,
    activateScene,
    deleteScene,
  };
}
