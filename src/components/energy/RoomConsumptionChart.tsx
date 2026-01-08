import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Device, Room } from '@/types/smarthome';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RoomConsumptionChartProps {
  devices: Device[];
  rooms: Room[];
}

const COLORS = ['#00ffff', '#a855f7', '#00ff88', '#ff8800', '#ff0088', '#0088ff', '#ffff00', '#ff4444'];

export function RoomConsumptionChart({ devices, rooms }: RoomConsumptionChartProps) {
  const data = useMemo(() => {
    return rooms.map((room, index) => {
      const roomDevices = devices.filter((d) => d.room_id === room.id && d.is_on);
      const consumption = roomDevices.reduce((sum, d) => sum + (d.power_consumption || 0), 0);
      return {
        name: room.name,
        value: consumption,
        color: COLORS[index % COLORS.length],
      };
    }).filter((r) => r.value > 0);
  }, [devices, rooms]);

  if (data.length === 0) {
    return (
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Room Power Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No active devices to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle>Room Power Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 10%)',
                  border: '1px solid hsl(222 30% 18%)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}W`, 'Power']}
              />
              <Legend
                formatter={(value) => <span className="text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
