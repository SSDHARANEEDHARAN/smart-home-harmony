import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { Device } from '@/types/smarthome';
import { DeviceIcon } from './DeviceIcon';
import { DeviceToggle } from './DeviceToggle';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: Device;
  onToggle: (isOn: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showControls?: boolean;
  compact?: boolean;
}

export function DeviceCard({
  device,
  onToggle,
  onEdit,
  onDelete,
  showControls = false,
  compact = false,
}: DeviceCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 border-border/50 internal-glow",
        device.is_on && "glow-active internal-border-glow border-foreground/20",
        compact ? "p-3" : ""
      )}
      style={{
        '--glow-color': device.glow_color,
      } as React.CSSProperties}
    >
      <CardContent className={cn("relative z-10", compact ? "p-0" : "p-4")}>
        <div className="flex items-center justify-between gap-4">
          {/* Device Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300",
                device.is_on ? "bg-foreground/10" : "bg-muted"
              )}
              style={{
                color: device.is_on ? device.glow_color : undefined,
              }}
            >
              <DeviceIcon type={device.device_type} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{device.name}</h3>
              {device.room && (
                <p className="text-xs text-muted-foreground truncate">
                  {device.room.name}
                </p>
              )}
            </div>
          </div>

          {/* Toggle Control */}
          <div className="flex items-center gap-2">
            <DeviceToggle
              isOn={device.is_on}
              style={device.toggle_style}
              glowColor={device.glow_color}
              onToggle={onToggle}
              value={device.brightness}
            />
          </div>
        </div>

        {/* Additional Controls */}
        {showControls && (
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border/50">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
