import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { EnergyStats } from '@/components/energy/EnergyStats';
import { DeviceConsumptionList } from '@/components/energy/DeviceConsumptionList';
import { RoomConsumptionChart } from '@/components/energy/RoomConsumptionChart';
import { DeviceUsageHistory } from '@/components/energy/DeviceUsageHistory';
import { useAuth } from '@/hooks/useAuth';
import { useRooms } from '@/hooks/useRooms';
import { useDevices } from '@/hooks/useDevices';
import { useEnergyStats } from '@/hooks/useEnergyStats';
import { Loader2, Zap } from 'lucide-react';

export default function Energy() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const { devices, isLoading: devicesLoading } = useDevices();
  const { data: logs = [], isLoading: logsLoading } = useEnergyStats();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roomsLoading || devicesLoading || logsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Energy</h1>
              <p className="text-muted-foreground">Monitor your power consumption</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <EnergyStats devices={devices} />
        </div>

        {/* Charts and Lists */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <RoomConsumptionChart devices={devices} rooms={rooms} />
          <DeviceConsumptionList devices={devices} />
        </div>

        {/* Usage History */}
        <div className="mb-8">
          <DeviceUsageHistory logs={logs} devices={devices} />
        </div>
      </div>
    </Layout>
  );
}
