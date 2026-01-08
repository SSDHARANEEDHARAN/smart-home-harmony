import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import { AutomationRule } from '@/types/smarthome';
import { DeviceIcon } from '@/components/devices/DeviceIcon';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface AutomationRuleCardProps {
  rule: AutomationRule;
  onToggle: (isEnabled: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AutomationRuleCard({
  rule,
  onToggle,
  onEdit,
  onDelete,
}: AutomationRuleCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <Card className={`glass border-border/50 transition-all ${rule.is_enabled ? 'border-primary/30' : 'opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {rule.device && (
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                rule.is_enabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                <DeviceIcon type={rule.device.device_type} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{rule.name}</h3>
              {rule.device && (
                <p className="text-sm text-muted-foreground">{rule.device.name}</p>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{formatTime(rule.trigger_time)}</span>
                <Badge variant={rule.target_state ? 'default' : 'secondary'} className="text-xs">
                  Turn {rule.target_state ? 'ON' : 'OFF'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {rule.days_of_week.map((day) => (
                  <span
                    key={day}
                    className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                  >
                    {DAYS[day]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Switch
              checked={rule.is_enabled}
              onCheckedChange={onToggle}
            />
            <div className="flex gap-1">
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
