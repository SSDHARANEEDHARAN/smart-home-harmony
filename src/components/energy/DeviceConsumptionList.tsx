import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Device } from '@/types/smarthome';
import { DeviceIcon } from '@/components/devices/DeviceIcon';

interface DeviceConsumptionListProps {
  devices: Device[];
}

export function DeviceConsumptionList({ devices }: DeviceConsumptionListProps) {
  const activeDevices = devices.filter((d) => d.is_on);
  const maxConsumption = Math.max(...devices.map((d) => d.power_consumption || 0), 1);
  const totalConsumption = activeDevices.reduce((sum, d) => sum + (d.power_consumption || 0), 0);

  // Sort by consumption (active first, then by power)
  const sortedDevices = [...devices].sort((a, b) => {
    if (a.is_on !== b.is_on) return b.is_on ? 1 : -1;
    return (b.power_consumption || 0) - (a.power_consumption || 0);
  });

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Device Power Usage</span>
          <span className="text-sm font-normal text-muted-foreground">
            Total: {totalConsumption}W active
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedDevices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No devices added yet
          </p>
        ) : (
          sortedDevices.map((device) => {
            const percentage = ((device.power_consumption || 0) / maxConsumption) * 100;
            return (
              <div key={device.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        device.is_on ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <DeviceIcon type={device.device_type} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.room?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${device.is_on ? 'text-primary' : 'text-muted-foreground'}`}>
                      {device.is_on ? device.power_consumption : 0}W
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {device.is_on ? 'Active' : 'Off'}
                    </p>
                  </div>
                </div>
                <Progress
                  value={device.is_on ? percentage : 0}
                  className="h-2"
                  style={{
                    '--progress-color': device.glow_color,
                  } as React.CSSProperties}
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
