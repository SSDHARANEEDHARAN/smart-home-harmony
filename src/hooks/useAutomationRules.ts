import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AutomationRule, DeviceType, ToggleStyle } from '@/types/smarthome';
import { toast } from 'sonner';

export function useAutomationRules() {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*, device:devices(*)')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data.map(r => ({
        ...r,
        device: r.device ? {
          ...r.device,
          device_type: r.device.device_type as DeviceType,
          toggle_style: r.device.toggle_style as ToggleStyle,
        } : undefined,
      })) as AutomationRule[];
    },
  });

  const createRule = useMutation({
    mutationFn: async (rule: Omit<AutomationRule, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'device'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('automation_rules')
        .insert({ ...rule, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Automation rule created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create rule: ' + error.message);
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutomationRule> & { id: string }) => {
      const { device, ...cleanUpdates } = updates;
      const { data, error } = await supabase
        .from('automation_rules')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Rule updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update rule: ' + error.message);
    },
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .update({ is_enabled })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success(`Rule ${data.is_enabled ? 'enabled' : 'disabled'}`);
    },
    onError: (error) => {
      toast.error('Failed to toggle rule: ' + error.message);
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('automation_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Rule deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete rule: ' + error.message);
    },
  });

  return {
    rules,
    isLoading,
    createRule,
    updateRule,
    toggleRule,
    deleteRule,
  };
}
