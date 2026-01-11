import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { RoomCard } from '@/components/rooms/RoomCard';
import { SceneCard } from '@/components/scenes/SceneCard';
import { CreateSceneDialog } from '@/components/scenes/CreateSceneDialog';
import { VoiceControl } from '@/components/voice/VoiceControl';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRooms } from '@/hooks/useRooms';
import { useDevices } from '@/hooks/useDevices';
import { useScenes } from '@/hooks/useScenes';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useDeviceNotifications } from '@/hooks/useDeviceNotifications';
import { Loader2, Home, Zap, Plus, Power } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const { devices, isLoading: devicesLoading, toggleDevice } = useDevices();
  const { scenes, activateScene, deleteScene } = useScenes();

  // Enable device notifications
  useDeviceNotifications(devices);

  const handleToggleDevice = (deviceId: string, isOn: boolean) => {
    const device = devices.find(d => d.id === deviceId);
    toggleDevice.mutate({ id: deviceId, is_on: isOn, relay_pin: device?.relay_pin });
  };

  const handleToggleAllDevices = (roomId: string, isOn: boolean) => {
    const roomDevices = devices.filter(d => d.room_id === roomId);
    roomDevices.forEach(device => {
      if (device.is_on !== isOn) {
        toggleDevice.mutate({ id: device.id, is_on: isOn, relay_pin: device.relay_pin });
      }
    });
  };

  const handleActivateScene = (scene: typeof scenes[0]) => {
    activateScene.mutate(scene);
  };

  const voiceControl = useVoiceControl({
    devices,
    scenes,
    onToggleDevice: handleToggleDevice,
    onActivateScene: handleActivateScene,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roomsLoading || devicesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      </Layout>
    );
  }

  const activeDevicesCount = devices.filter((d) => d.is_on).length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center">
              <Home className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Power className="w-4 h-4" />
                <span>{activeDevicesCount}/{devices.length} devices active</span>
              </div>
            </div>
          </div>
          
          {/* Voice Control */}
          <VoiceControl
            isListening={voiceControl.isListening}
            isSupported={voiceControl.isSupported}
            transcript={voiceControl.transcript}
            onStart={voiceControl.startListening}
            onStop={voiceControl.stopListening}
          />
        </div>

        {/* Scenes Section */}
        {scenes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Quick Scenes</h2>
              </div>
              <CreateSceneDialog devices={devices} />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scenes.map((scene) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  onActivate={() => handleActivateScene(scene)}
                  onDelete={() => deleteScene.mutate(scene.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rooms Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Rooms & Controls</h2>
          <div className="flex items-center gap-2">
            {scenes.length === 0 && <CreateSceneDialog devices={devices} />}
            <Link to="/devices">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Devices
              </Button>
            </Link>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12 glass rounded-xl border border-border/50">
            <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rooms yet</h3>
            <p className="text-muted-foreground mb-4">
              Create rooms and add devices from the Devices page
            </p>
            <Link to="/devices">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Go to Devices
              </Button>
            </Link>
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
                  onToggleAllDevices={handleToggleAllDevices}
                />
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground text-center">
            💡 Customize devices on the{' '}
            <Link to="/devices" className="text-foreground underline underline-offset-2 hover:no-underline">
              Devices page
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
