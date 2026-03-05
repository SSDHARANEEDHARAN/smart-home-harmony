import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Power } from 'lucide-react';
import { Room, Device } from '@/types/smarthome';
import { DeviceToggle } from '@/components/devices/DeviceToggle';
import { DeviceIcon } from '@/components/devices/DeviceIcon';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
  devices: Device[];
  onToggleDevice: (deviceId: string, isOn: boolean) => void;
  onToggleAllDevices?: (roomId: string, isOn: boolean) => void;
}

export function RoomCard({
  room,
  devices,
  onToggleDevice,
  onToggleAllDevices,
}: RoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeDevices = devices.filter((d) => d.is_on).length;
  const allOn = devices.length > 0 && activeDevices === devices.length;
  const IconComponent = (LucideIcons as any)[room.icon] || LucideIcons.Home;

  // Calculate room glow based on active devices
  const activeDeviceColors = devices.filter(d => d.is_on).map(d => d.glow_color);
  const roomGlowColor = activeDeviceColors[0] || '#ffffff';

  const handleToggleAll = () => {
    if (onToggleAllDevices) {
      onToggleAllDevices(room.id, !allOn);
    }
  };

  return (
    <Card 
      className={cn(
        "glass border-border/50 overflow-hidden transition-all duration-300 internal-glow",
        activeDevices > 0 && "glow-active internal-border-glow border-foreground/20"
      )}
      style={{
        '--glow-color': roomGlowColor,
      } as React.CSSProperties}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent 
              className="w-5 h-5 transition-all"
              style={{
                color: activeDevices > 0 ? roomGlowColor : undefined,
              }}
            />
            <div>
              <CardTitle className="text-sm">{room.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {activeDevices}/{devices.length} active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Room Power Button */}
            {devices.length > 0 && (
              <Button
                variant={allOn ? 'default' : 'outline'}
                size="icon"
                onClick={handleToggleAll}
                className={cn(
                  "w-10 h-10 rounded-full transition-all duration-300",
                  allOn && "shadow-lg"
                )}
                style={{
                  backgroundColor: allOn ? roomGlowColor : undefined,
                  boxShadow: allOn ? `inset 0 0 15px rgba(255,255,255,0.3)` : undefined,
                }}
              >
                <Power className={cn("w-4 h-4", allOn ? "text-background" : "text-foreground")} />
              </Button>
            )}

            {devices.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {devices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No devices. Add from Devices page.
          </p>
        ) : isExpanded ? (
          // Expanded view - show individual device controls
          <div className="space-y-2">
            {devices.map((device) => (
              <div 
                key={device.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-all internal-glow",
                  device.is_on 
                    ? "bg-foreground/5 glow-active internal-border-glow" 
                    : "bg-muted/50 hover:bg-muted"
                )}
                style={{
                  '--glow-color': device.glow_color,
                } as React.CSSProperties}
              >
                <div className="flex items-center gap-3">
                  <DeviceIcon 
                    type={device.device_type} 
                    className="w-4 h-4 transition-all"
                    style={{
                      color: device.is_on ? device.glow_color : undefined,
                    }}
                  />
                  <span className="text-sm font-medium">{device.name}</span>
                </div>
                <DeviceToggle
                  isOn={device.is_on}
                  style={device.toggle_style}
                  glowColor={device.glow_color}
                  onToggle={(isOn) => onToggleDevice(device.id, isOn)}
                  value={device.brightness}
                />
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
