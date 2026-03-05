import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Activity, Power, TrendingUp } from 'lucide-react';
import { Device } from '@/types/smarthome';

interface EnergyStatsProps {
  devices: Device[];
}

export function EnergyStats({ devices }: EnergyStatsProps) {
  const activeDevices = devices.filter((d) => d.is_on);
  const totalConsumption = activeDevices.reduce((sum, d) => sum + (d.power_consumption || 0), 0);
  
  // Estimate monthly consumption (assuming 8 hours average usage per day)
  const dailyKwh = (totalConsumption * 8) / 1000;
  const monthlyKwh = dailyKwh * 30;
  
  // Estimate cost (assuming $0.12 per kWh)
  const monthlyCost = monthlyKwh * 0.12;

  const stats = [
    {
      title: 'Current Power',
      value: `${totalConsumption}`,
      unit: 'W',
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      title: 'Active Devices',
      value: `${activeDevices.length}`,
      unit: `/ ${devices.length}`,
      icon: Power,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
    },
    {
      title: 'Est. Daily Usage',
      value: dailyKwh.toFixed(2),
      unit: 'kWh',
      icon: Activity,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
    },
    {
      title: 'Est. Monthly Cost',
      value: `$${monthlyCost.toFixed(2)}`,
      unit: '/month',
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="glass border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.unit}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
