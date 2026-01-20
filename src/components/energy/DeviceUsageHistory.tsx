import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnergyLog, Device } from '@/types/smarthome';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DeviceUsageHistoryProps {
  logs: EnergyLog[];
  devices: Device[];
}

export function DeviceUsageHistory({ logs, devices }: DeviceUsageHistoryProps) {
  const chartData = useMemo(() => {
    // Get last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'EEE'),
        fullDate: date,
        consumption: 0,
      };
    });

    // Group logs by day
    logs.forEach((log) => {
      const logDate = new Date(log.logged_at);
      const dayIndex = days.findIndex((day) => {
        const start = startOfDay(day.fullDate);
        const end = endOfDay(day.fullDate);
        return logDate >= start && logDate <= end;
      });
      if (dayIndex !== -1) {
        days[dayIndex].consumption += log.consumption;
      }
    });

    return days.map((day) => ({
      date: day.date,
      consumption: Number(day.consumption.toFixed(2)),
    }));
  }, [logs]);

  const totalConsumption = chartData.reduce((sum, d) => sum + d.consumption, 0);
  const avgConsumption = totalConsumption / 7;

  if (logs.length === 0) {
    return (
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Usage History (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No usage data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Usage History (7 Days)</span>
          <div className="flex items-center gap-4 text-sm font-normal">
            <span className="text-muted-foreground">
              Total: <span className="text-primary font-medium">{totalConsumption.toFixed(2)} kWh</span>
            </span>
            <span className="text-muted-foreground">
              Avg: <span className="text-secondary font-medium">{avgConsumption.toFixed(2)} kWh/day</span>
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}kWh`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value} kWh`, 'Consumption']}
              />
              <Area
                type="monotone"
                dataKey="consumption"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorConsumption)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
