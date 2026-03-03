import { Device } from '@/types/smarthome';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceStatusGridProps {
  devices: Device[];
}

export function DeviceStatusGrid({ devices }: DeviceStatusGridProps) {
  if (devices.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Power className="w-8 h-8 mb-2" />
          <p className="text-sm">No devices found. Add devices from the Devices page.</p>
        </CardContent>
      </Card>
    );
  }

  const onlineCount = devices.filter(d => d.is_on).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Device Status</h2>
        <span className="text-xs text-muted-foreground">
          {onlineCount}/{devices.length} active
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {devices.map(device => (
          <Card
            key={device.id}
            className={cn(
              "transition-all duration-300 border",
              device.is_on
                ? "border-primary/30 bg-primary/5"
                : "border-border/50 bg-muted/20"
            )}
          >
            <CardContent className="p-3 flex flex-col items-center gap-1.5 text-center">
              <div className={cn(
                "w-3 h-3 rounded-full",
                device.is_on ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-muted-foreground/30"
              )} />
              <span className="text-xs font-medium text-foreground truncate w-full">
                {device.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {device.is_on ? 'ON' : 'OFF'}
                {device.relay_pin ? ` · Pin ${device.relay_pin}` : ''}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
