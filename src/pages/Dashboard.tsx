import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
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
import { DeviceToggle } from '@/components/devices/DeviceToggle';
import { DeviceIcon } from '@/components/devices/DeviceIcon';
import { Loader2, Home, Zap, Plus, Power } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

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
        {/* Workspace Home Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-foreground/10 flex items-center justify-center">
              <Home className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Workspace Home</h1>
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

        {/* Rooms & Control Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Rooms & Control</h2>
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
          <div className="text-center py-12 glass border border-border/50">
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
          <div className="space-y-8">
            {rooms.map((room) => {
              const roomDevices = devices.filter((d) => d.room_id === room.id);
              const activeCount = roomDevices.filter(d => d.is_on).length;
              const allOn = roomDevices.length > 0 && activeCount === roomDevices.length;
              const IconComponent = (LucideIcons as any)[room.icon] || LucideIcons.Home;
              const activeDeviceColors = roomDevices.filter(d => d.is_on).map(d => d.glow_color);
              const roomGlowColor = activeDeviceColors[0] || '#ffffff';

              return (
                <div key={room.id} className="space-y-4">
                  {/* Room Name Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className={cn(
                          "w-10 h-10 flex items-center justify-center transition-all",
                          activeCount > 0 ? "bg-foreground/10" : "bg-muted"
                        )}
                        style={{
                          color: activeCount > 0 ? roomGlowColor : undefined,
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{room.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activeCount}/{roomDevices.length} active
                        </p>
                      </div>
                    </div>
                    
                    {roomDevices.length > 0 && (
                      <Button
                        variant={allOn ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => handleToggleAllDevices(room.id, !allOn)}
                        className="w-10 h-10 transition-all duration-300"
                        style={{
                          backgroundColor: allOn ? roomGlowColor : undefined,
                          boxShadow: allOn ? `inset 0 0 15px rgba(255,255,255,0.3)` : undefined,
                        }}
                      >
                        <Power className={cn("w-4 h-4", allOn ? "text-background" : "text-foreground")} />
                      </Button>
                    )}
                  </div>

                  {/* Device Cards Grid - 4 per row, overflow centered */}
                  {roomDevices.length === 0 ? (
                    <div className="text-center py-6 glass border border-border/50">
                      <p className="text-sm text-muted-foreground">No devices in this room</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {roomDevices.map((device, index) => {
                        const isLastRow = index >= Math.floor(roomDevices.length / 4) * 4;
                        const remainingInRow = roomDevices.length % 4;
                        const shouldCenter = isLastRow && remainingInRow > 0 && remainingInRow < 4;
                        
                        return (
                          <div
                            key={device.id}
                            className={cn(
                              "glass border border-border/50 p-4 transition-all duration-500 internal-glow",
                              device.is_on && "glow-active internal-border-glow border-foreground/20",
                              // Center last row items if less than 4
                              shouldCenter && index === Math.floor(roomDevices.length / 4) * 4 && remainingInRow === 1 && "lg:col-start-2 lg:col-end-4",
                              shouldCenter && remainingInRow === 2 && index === Math.floor(roomDevices.length / 4) * 4 && "lg:col-start-2",
                              shouldCenter && remainingInRow === 3 && index === Math.floor(roomDevices.length / 4) * 4 && "lg:col-start-1"
                            )}
                            style={{
                              '--glow-color': device.glow_color,
                            } as React.CSSProperties}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className={cn(
                                    "flex items-center justify-center w-10 h-10 transition-all duration-300",
                                    device.is_on ? "bg-foreground/10" : "bg-muted"
                                  )}
                                  style={{
                                    color: device.is_on ? device.glow_color : undefined,
                                  }}
                                >
                                  <DeviceIcon type={device.device_type} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold truncate text-sm">{device.name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {device.is_on ? 'On' : 'Off'}
                                  </p>
                                </div>
                              </div>

                              <DeviceToggle
                                isOn={device.is_on}
                                style={device.toggle_style}
                                glowColor={device.glow_color}
                                onToggle={(isOn) => handleToggleDevice(device.id, isOn)}
                                value={device.brightness}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 p-4 bg-muted/30 border border-border/50">
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
