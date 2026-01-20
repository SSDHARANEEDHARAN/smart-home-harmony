import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Clock, Calendar } from 'lucide-react';
import { Device } from '@/types/smarthome';
import { DeviceIcon } from './DeviceIcon';
import { DeviceToggle } from './DeviceToggle';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DeviceCardProps {
  device: Device;
  onToggle: (isOn: boolean) => void;
  onValueChange?: (value: number) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showControls?: boolean;
  compact?: boolean;
}

function ScheduleDialog({ deviceId, deviceName }: { deviceId: string; deviceName: string }) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState('');
  const [action, setAction] = useState<'on' | 'off'>('off');
  const { createRule } = useAutomationRules();

  const handleSave = async () => {
    if (!time) {
      toast.error('Please select a time');
      return;
    }

    try {
      await createRule.mutateAsync({
        name: `${deviceName} - ${action === 'on' ? 'Turn On' : 'Turn Off'} at ${time}`,
        device_id: deviceId,
        trigger_time: time,
        action: action === 'on' ? 'turn_on' : 'turn_off',
        target_state: action === 'on',
        is_enabled: true,
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
      });
      setOpen(false);
      setTime('');
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Clock className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Schedule</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>Set Schedule</DialogTitle>
          <DialogDescription>
            Automatically turn {deviceName} on or off at a specific time.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="schedule-time" className="text-right">
              Time
            </Label>
            <Input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="col-span-3 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-sm">Action</span>
            <div className="col-span-3 flex gap-2">
              <Button
                variant={action === 'on' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAction('on')}
                className="rounded-lg"
              >
                Turn On
              </Button>
              <Button
                variant={action === 'off' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAction('off')}
                className="rounded-lg"
              >
                Turn Off
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={createRule.isPending} className="rounded-lg">
            {createRule.isPending ? 'Saving...' : 'Save Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const { rules } = useAutomationRules();

  // Calculate next scheduled run
  const nextSchedule = (() => {
    const deviceRules = rules.filter(r => r.device_id === device.id && r.is_enabled);
    if (!deviceRules.length) return null;

    const now = new Date();
    let nextRun: { date: Date, action: boolean } | null = null;

    deviceRules.forEach(rule => {
      const [h, m] = rule.trigger_time.split(':').map(Number);
      const days = rule.days_of_week || [0, 1, 2, 3, 4, 5, 6];

      for (let i = 0; i <= 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        checkDate.setHours(h, m, 0, 0);

        if (i === 0 && checkDate <= now) continue;

        if (days.includes(checkDate.getDay())) {
          if (!nextRun || checkDate < nextRun.date) {
            nextRun = { date: checkDate, action: rule.target_state ?? false };
          }
          break;
        }
      }
    });
    
    return nextRun;
  })();

  const formatNextRun = (date: Date) => {
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth();
    const isTomorrow = new Date(now.getTime() + 86400000).getDate() === date.getDate();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return `Today ${timeStr}`;
    if (isTomorrow) return `Tom ${timeStr}`;
    return `${date.toLocaleDateString([], { weekday: 'short' })} ${timeStr}`;
  };

  useEffect(() => {
    const checkDark = () => {
      if (theme === 'system') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setIsDark(theme === 'dark');
      }
    };
    
    checkDark();
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const bgColorStyle = device.is_on && device.glow_color && isDark
    ? { backgroundColor: device.glow_color + '20' }
    : {};

  const cardStyle: React.CSSProperties & Record<string, string | undefined> = {
    '--glow-color': device.glow_color,
    ...bgColorStyle,
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 border-border/50 internal-glow rounded-xl",
        device.is_on && "glow-active internal-border-glow border-foreground/20",
        "p-2"
      )}
      style={cardStyle}
    >
      <CardContent className="relative z-10 p-2">
        <div className="flex items-center justify-between gap-2">
          {/* Device Info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
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
              {nextSchedule && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {nextSchedule.action ? 'On' : 'Off'} {formatNextRun(nextSchedule.date)}
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

        {/* Additional Controls (only on full cards, not compact Dashboard cards) */}
        {showControls && !compact && (
          <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-border/50">
            <ScheduleDialog deviceId={device.id} deviceName={device.name} />
            
            {onEdit && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onEdit}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {onDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onDelete}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
