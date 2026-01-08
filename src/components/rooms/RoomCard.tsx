import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Room, Device } from '@/types/smarthome';
import { DeviceCard } from '@/components/devices/DeviceCard';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
  devices: Device[];
  onToggleDevice: (deviceId: string, isOn: boolean) => void;
  onEditRoom?: () => void;
  onDeleteRoom?: () => void;
  onAddDevice?: () => void;
  expanded?: boolean;
}

export function RoomCard({
  room,
  devices,
  onToggleDevice,
  onEditRoom,
  onDeleteRoom,
  onAddDevice,
  expanded = false,
}: RoomCardProps) {
  const activeDevices = devices.filter((d) => d.is_on).length;
  const IconComponent = (LucideIcons as any)[room.icon] || LucideIcons.Home;

  return (
    <Card className={cn(
      "glass border-border/50 overflow-hidden transition-all duration-300",
      activeDevices > 0 && "border-primary/30"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              activeDevices > 0 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{room.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {devices.length} devices • {activeDevices} active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onAddDevice && (
              <Button variant="ghost" size="icon" onClick={onAddDevice} className="text-muted-foreground hover:text-primary">
                <Plus className="w-4 h-4" />
              </Button>
            )}
            {onEditRoom && (
              <Button variant="ghost" size="icon" onClick={onEditRoom} className="text-muted-foreground hover:text-primary">
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {onDeleteRoom && (
              <Button variant="ghost" size="icon" onClick={onDeleteRoom} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && devices.length > 0 && (
        <CardContent className="pt-2">
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
        </CardContent>
      )}

      {!expanded && devices.length > 0 && (
        <CardContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {devices.slice(0, 4).map((device) => (
              <div
                key={device.id}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                  device.is_on
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                onClick={() => onToggleDevice(device.id, !device.is_on)}
                style={{
                  boxShadow: device.is_on ? `0 0 10px ${device.glow_color}40` : undefined,
                }}
              >
                {device.name}
              </div>
            ))}
            {devices.length > 4 && (
              <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                +{devices.length - 4} more
              </div>
            )}
          </div>
        </CardContent>
      )}

      {devices.length === 0 && (
        <CardContent className="pt-2">
          <p className="text-sm text-muted-foreground text-center py-4">
            No devices in this room
          </p>
        </CardContent>
      )}
    </Card>
  );
}
