import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { RoomCard } from '@/components/rooms/RoomCard';
import { CreateRoomDialog } from '@/components/rooms/CreateRoomDialog';
import { EnergyStats } from '@/components/energy/EnergyStats';
import { useAuth } from '@/hooks/useAuth';
import { useRooms } from '@/hooks/useRooms';
import { useDevices } from '@/hooks/useDevices';
import { Loader2, Home } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const { devices, isLoading: devicesLoading, toggleDevice } = useDevices();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roomsLoading || devicesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const handleToggleDevice = (deviceId: string, isOn: boolean) => {
    toggleDevice.mutate({ id: deviceId, is_on: isOn });
  };

  const activeDevicesCount = devices.filter((d) => d.is_on).length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                {activeDevicesCount} device{activeDevicesCount !== 1 ? 's' : ''} active
              </p>
            </div>
          </div>
        </div>

        {/* Energy Stats */}
        <div className="mb-8">
          <EnergyStats devices={devices} />
        </div>

        {/* Rooms Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Rooms</h2>
          <CreateRoomDialog />
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12 glass rounded-xl border border-border/50">
            <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rooms yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first room to start adding devices
            </p>
            <CreateRoomDialog />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const roomDevices = devices.filter((d) => d.room_id === room.id);
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  devices={roomDevices}
                  onToggleDevice={handleToggleDevice}
                />
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
