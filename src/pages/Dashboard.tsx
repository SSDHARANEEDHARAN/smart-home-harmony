import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { RoomGroupCard } from '@/components/rooms/RoomGroupCard';
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
import { useSettings } from '@/hooks/useSettings';
import { useHome } from '@/contexts/HomeContext';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { FirebaseStatusBadge } from '@/components/firebase/FirebaseStatusBadge';
import { Loader2, Home, Zap, Plus, Power, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const { devices, isLoading: devicesLoading, toggleDevice, updateDevice } = useDevices();
  const { scenes, activateScene, deleteScene } = useScenes();
  const { settings } = useSettings();
  const { homes, currentHomeId, setCurrentHomeId, currentHome } = useHome();

  // Enable Firebase bi-directional sync
  useFirebaseSync();

  // Enable device notifications
  useDeviceNotifications(devices);

  const activeDevicesCount = devices.filter((d) => d.is_on).length;

  const handleToggleDevice = (deviceId: string, isOn: boolean) => {
    const device = devices.find(d => d.id === deviceId);
    toggleDevice.mutate({ id: deviceId, is_on: isOn, relay_pin: device?.relay_pin });
  };

  const handleValueChange = (deviceId: string, value: number) => {
    updateDevice.mutate({ id: deviceId, brightness: value });
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

  if (authLoading || devicesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-responsive py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 header-responsive">
          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold">Dashboard</h1>
                <FirebaseStatusBadge variant="compact" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Power className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{activeDevicesCount}/{devices.length} devices active</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Home Cards - Simple display without dropdown */}
            {homes.length > 1 ? (
              <div className="flex items-center gap-2">
                {homes.map((home) => (
                  <button
                    key={home.id}
                    onClick={() => setCurrentHomeId(home.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      home.id === currentHomeId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    <Home className="w-4 h-4" />
                    {home.name}
                    {home.id === currentHomeId && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            ) : homes.length === 1 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-muted text-muted-foreground">
                <Home className="w-4 h-4" />
                {homes[0].name}
              </div>
            ) : null}
            <VoiceControl 
              isListening={voiceControl.isListening}
              isSupported={voiceControl.isSupported}
              transcript={voiceControl.transcript}
              onStart={voiceControl.startListening}
              onStop={voiceControl.stopListening}
            />
          </div>
        </div>

        {/* Quick Scenes */}
        {settings.notifications.sceneActivations && scenes.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <h2 className="font-semibold">Quick Scenes</h2>
              </div>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {scenes.slice(0, 6).map((scene) => (
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

        {/* Devices & Controls */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <h2 className="font-semibold">Devices & Controls</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/devices">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add Device</span>
                </Button>
              </Link>
              <CreateSceneDialog devices={devices} />
            </div>
          </div>

          {devices.length === 0 ? (
            <div className="text-center py-8 sm:py-12 glass border border-border/50">
              <Power className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">No devices found. Add your first device to get started.</p>
              <Link to="/devices">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Device
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {rooms.map((room) => {
                const roomDevices = devices.filter((d) => d.room_id === room.id);
                if (roomDevices.length === 0) return null;

                return (
                  <RoomGroupCard
                    key={room.id}
                    room={room}
                    devices={roomDevices}
                    onToggleDevice={handleToggleDevice}
                    onValueChange={handleValueChange}
                  />
                );
              })}

              {/* Unassigned devices */}
              {devices.filter((d) => !rooms.find((r) => r.id === d.room_id)).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Power className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium text-muted-foreground">Unassigned</h3>
                  </div>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {devices
                      .filter((d) => !rooms.find((r) => r.id === d.room_id))
                      .map((device) => (
                        <DeviceCard
                          key={device.id}
                          device={device}
                          onToggle={(isOn) => handleToggleDevice(device.id, isOn)}
                          onValueChange={(value) => handleValueChange(device.id, value)}
                          compact
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="glass border border-border/50 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Smart Home Dashboard</p>
              <p className="text-xs text-muted-foreground">
                Manage all your devices from one place. Visit{' '}
                <Link to="/devices" className="text-primary hover:underline">
                  Devices
                </Link>{' '}
                for detailed controls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
