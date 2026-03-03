import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/smarthome';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

interface SensorChartsProps {
  sensorDevices: Device[];
}

export function SensorCharts({ sensorDevices }: SensorChartsProps) {
  const deviceIds = sensorDevices.map(d => d.id);

  const { data: logs = [] } = useQuery({
    queryKey: ['sensor-chart-logs', deviceIds],
    queryFn: async () => {
      if (deviceIds.length === 0) return [];
      const { data, error } = await supabase
        .from('energy_logs')
        .select('*')
        .in('device_id', deviceIds)
        .order('logged_at', { ascending: true })
        .limit(200);
      if (error) throw error;
      return data;
    },
    enabled: deviceIds.length > 0,
    refetchInterval: 10000,
  });

  if (sensorDevices.length === 0) return null;

  // Group logs by device
  const logsByDevice = new Map<string, typeof logs>();
  logs.forEach(log => {
    const existing = logsByDevice.get(log.device_id) || [];
    existing.push(log);
    logsByDevice.set(log.device_id, existing);
  });

  const chartConfig: Record<string, { label: string; color: string }> = {};
  sensorDevices.forEach((d, i) => {
    const colors = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    chartConfig[d.id] = { label: d.name, color: colors[i % colors.length] };
  });

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Sensor History</h2>

      {logs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <BarChart3 className="w-8 h-8 mb-2" />
            <p className="text-sm">No historical sensor data yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sensorDevices.map(device => {
            const deviceLogs = logsByDevice.get(device.id) || [];
            if (deviceLogs.length === 0) return null;

            const chartData = deviceLogs.map(log => ({
              time: format(new Date(log.logged_at), 'HH:mm'),
              value: Number(log.consumption),
            }));

            return (
              <Card key={device.id} className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{device.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ value: { label: device.name, color: 'hsl(var(--primary))' } }} className="h-[200px]">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="time" className="text-[10px]" />
                      <YAxis className="text-[10px]" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
