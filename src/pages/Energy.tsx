import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { EnergyStats } from '@/components/energy/EnergyStats';
import { DeviceConsumptionList } from '@/components/energy/DeviceConsumptionList';
import { RoomConsumptionChart } from '@/components/energy/RoomConsumptionChart';
import { DeviceUsageHistory } from '@/components/energy/DeviceUsageHistory';
import { RelayStatusPanel } from '@/components/relay/RelayStatusPanel';
import { RelayHistoryLog } from '@/components/energy/RelayHistoryLog';
import { HardwareActivityDashboard } from '@/components/energy/HardwareActivityDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useRooms } from '@/hooks/useRooms';
import { useDevices } from '@/hooks/useDevices';
import { useEnergyStats } from '@/hooks/useEnergyStats';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { useHome } from '@/contexts/HomeContext';
import { Loader2, Zap, Home } from 'lucide-react';

export default function Energy() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const { devices, isLoading: devicesLoading } = useDevices();
  const { data: logs = [], isLoading: logsLoading } = useEnergyStats();
  const { currentHomeId, currentHome } = useHome();

  // Enable Firebase bi-directional sync
  useFirebaseSync();

  // Filter rooms and devices by current workspace
  const filteredRooms = rooms.filter((room: any) => 
    room.home_id === currentHomeId || (!room.home_id && currentHomeId === 'home')
  );
  const filteredDevices = devices.filter((device: any) => 
    device.home_id === currentHomeId || (!device.home_id && currentHomeId === 'home')
  );

  // Filter energy logs to only include devices from the current workspace
  const filteredDeviceIds = new Set(filteredDevices.map(d => d.id));
  const filteredLogs = logs.filter(log => filteredDeviceIds.has(log.device_id));

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
      <div className="container-responsive py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold">Energy</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Home className="w-3 h-3" />
                <span>{currentHome?.name || 'All Workspaces'}</span>
                <span>•</span>
                <span>{filteredDevices.length} devices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Relay Status Panel */}
        <div className="mb-6 sm:mb-8">
          <RelayStatusPanel />
        </div>

        {/* Hardware Activity Dashboard - Timeline + Stats */}
        <div className="mb-6 sm:mb-8">
          <HardwareActivityDashboard />
        </div>

        {/* Stats Overview */}
        <div className="mb-6 sm:mb-8">
          <EnergyStats devices={filteredDevices} />
        </div>

        {/* Charts and Lists */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mb-6 sm:mb-8">
          <RoomConsumptionChart devices={filteredDevices} rooms={filteredRooms} />
          <DeviceConsumptionList devices={filteredDevices} />
        </div>

        {/* Relay Activity Log */}
        <div className="mb-6 sm:mb-8">
          <RelayHistoryLog />
        </div>

        {/* Usage History */}
        <div className="mb-6 sm:mb-8">
          <DeviceUsageHistory logs={filteredLogs} devices={filteredDevices} />
        </div>
      </div>
    </Layout>
  );
}
