import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types/smarthome';
import { toast } from 'sonner';

export function useRooms() {
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Room[];
    },
  });

  const createRoom = useMutation({
    mutationFn: async (room: { name: string; icon: string; home_id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('rooms')
        .insert({ 
          name: room.name, 
          icon: room.icon, 
          user_id: user.id,
          home_id: room.home_id || 'home',
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create room: ' + error.message);
    },
  });

  const updateRoom = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Room> & { id: string }) => {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update room: ' + error.message);
    },
  });

  const deleteRoom = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Room deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete room: ' + error.message);
    },
  });

  return {
    rooms,
    isLoading,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}
