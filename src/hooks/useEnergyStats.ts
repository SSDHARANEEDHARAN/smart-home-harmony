import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnergyLog } from '@/types/smarthome';

export function useEnergyStats() {
  return useQuery({
    queryKey: ['energy-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('energy_logs')
        .select('*')
        .order('logged_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as EnergyLog[];
    },
  });
}
