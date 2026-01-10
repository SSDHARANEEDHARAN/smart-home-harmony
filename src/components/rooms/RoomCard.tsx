import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Room, Device } from '@/types/smarthome';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { DeviceToggle } from '@/components/devices/DeviceToggle';
import { DeviceIcon } from '@/components/devices/DeviceIcon';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
  devices: Device[];
  onToggleDevice: (deviceId: string, isOn: boolean) => void;
  showFullControls?: boolean;
}

export function RoomCard({
  room,
  devices,
  onToggleDevice,
  showFullControls = false,
}: RoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeDevices = devices.filter((d) => d.is_on).length;
  const IconComponent = (LucideIcons as any)[room.icon] || LucideIcons.Home;

  // Calculate room glow based on active devices
  const activeDeviceColors = devices.filter(d => d.is_on).map(d => d.glow_color);
  const roomGlowColor = activeDeviceColors[0] || '#ffffff';

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
            <div 
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                activeDevices > 0 ? "bg-foreground/10" : "bg-muted"
              )}
              style={{
                color: activeDevices > 0 ? roomGlowColor : undefined,
              }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{room.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {devices.length} device{devices.length !== 1 ? 's' : ''} • {activeDevices} active
              </p>
            </div>
          </div>

          {devices.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
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
      </CardHeader>

      <CardContent className="pt-2">
        {devices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No devices in this room. Add devices from the Devices page.
          </p>
        ) : isExpanded || showFullControls ? (
          // Expanded view - show full device cards
          <div className="grid gap-3">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onToggle={(isOn) => onToggleDevice(device.id, isOn)}
                compact
              />
            ))}
          </div>
        ) : (
          // Compact view - show device controls inline
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
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      device.is_on ? "bg-foreground/10" : "bg-muted"
                    )}
                    style={{
                      color: device.is_on ? device.glow_color : undefined,
                    }}
                  >
                    <DeviceIcon type={device.device_type} className="w-4 h-4" />
                  </div>
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
        )}
      </CardContent>
    </Card>
  );
}
