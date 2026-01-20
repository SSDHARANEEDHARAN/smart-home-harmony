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
  onValueChange?: (value: number) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showControls?: boolean;
  compact?: boolean;
}

export function DeviceCard({
  device,
  onToggle,
  onValueChange,
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
        "p-2"
      )}
      style={{
        '--glow-color': device.glow_color,
      } as React.CSSProperties}
    >
      <CardContent className="relative z-10 p-2">
        <div className="flex items-center justify-between gap-2">
          {/* Device Info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 transition-all duration-300",
                device.is_on ? "bg-foreground/10" : "bg-muted"
              )}
              style={{
                color: device.is_on ? device.glow_color : undefined,
              }}
            >
              <DeviceIcon type={device.device_type} className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold truncate">{device.name}</h3>
              {device.room && (
                <p className="text-xs text-muted-foreground truncate">
                  {device.room.name}
                </p>
              )}
            </div>
          </div>

          {/* Toggle Control */}
          <div className="flex items-center gap-1 shrink-0">
            <DeviceToggle
              isOn={device.is_on}
              style={device.toggle_style}
              glowColor={device.glow_color}
              onToggle={onToggle}
              value={device.brightness}
              onValueChange={onValueChange}
              step={device.slider_step || 10}
            />
          </div>
        </div>

        {/* Additional Controls */}
        {showControls && (
          <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-border/50">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
