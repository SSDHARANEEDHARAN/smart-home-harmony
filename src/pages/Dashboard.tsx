import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DeviceCard } from '@/components/devices/DeviceCard';
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
import { HomeSelector } from '@/components/home/HomeSelector';
import { Loader2, Home, Zap, Plus, Power } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const { devices, isLoading: devicesLoading, toggleDevice, updateDevice } = useDevices();
  const { scenes, activateScene, deleteScene } = useScenes();
  const { settings } = useSettings();
  const { getHomeForRoom, currentHomeId } = useHome();

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
              <h1 className="font-bold">Dashboard</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Power className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{activeDevicesCount}/{devices.length} devices active</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <HomeSelector />
            {/* Voice Control */}
            <VoiceControl
              isListening={voiceControl.isListening}
              isSupported={voiceControl.isSupported}
              transcript={voiceControl.transcript}
              onStart={voiceControl.startListening}
              onStop={voiceControl.stopListening}
            />
          </div>
        </div>

        {/* Scenes Section - Only show if sceneActivations setting is enabled */}
        {settings.notifications.sceneActivations && scenes.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <h2 className="font-semibold">Quick Scenes</h2>
              </div>
              <CreateSceneDialog devices={devices} />
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Devices Section */}
        <div className="mb-4 sm:mb-6 header-responsive">
          <h2 className="font-semibold">Devices & Controls</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {settings.notifications.sceneActivations && <CreateSceneDialog devices={devices} />}
            <Link to="/devices">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Add Devices</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </Link>
          </div>
        </div>

        {devices.length === 0 ? (
          <div className="text-center py-8 sm:py-12 glass border border-border/50">
            <Home className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="font-semibold mb-2">No devices found</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base px-4">
              Create devices from the Devices page to start controlling your home.
            </p>
            <Link to="/devices">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Go to Devices
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {/* Group devices by room */}
            {rooms
              .filter(room => devices.some(d => d.room_id === room.id))
              .map(room => {
                const roomDevices = devices.filter(d => d.room_id === room.id);
                return (
                  <div key={room.id}>
                    {/* Room Name Heading with Icon */}
                    <h3 className="font-semibold mb-2 sm:mb-3 text-foreground flex items-center gap-2">
                      {(() => {
                        const iconName = room.icon as keyof typeof LucideIcons;
                        const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string }>;
                        return IconComponent ? (
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        ) : (
                          <Home className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        );
                      })()}
                      {room.name}
                    </h3>
                    {/* Device Cards Grid */}
                    <div className="card-grid">
                      {roomDevices.map((device) => (
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
                );
              })}
            
            {/* Unassigned devices */}
            {devices.filter(d => !rooms.some(r => r.id === d.room_id)).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 sm:mb-3 text-foreground flex items-center gap-2">
                  <LucideIcons.HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  Unassigned
                </h3>
                <div className="card-grid">
                  {devices
                    .filter(d => !rooms.some(r => r.id === d.room_id))
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

        {/* Info Card */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-muted/30 border border-border/50">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
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
