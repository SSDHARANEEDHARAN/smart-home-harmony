import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Clock, Calendar, X, Pencil } from 'lucide-react';
import { Device, AutomationRule } from '@/types/smarthome';
import { DeviceIcon } from './DeviceIcon';
import { DeviceToggle } from './DeviceToggle';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
interface DeviceCardProps {
  device: Device;
  onToggle: (isOn: boolean) => void;
  onValueChange?: (value: number) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showControls?: boolean;
  compact?: boolean;
}
function ScheduleDialog({
  deviceId,
  deviceName,
  existingRule,
  onClose
}: {
  deviceId: string;
  deviceName: string;
  existingRule?: AutomationRule;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(!!existingRule);
  const [time, setTime] = useState(existingRule?.trigger_time?.slice(0, 5) || '');
  const [action, setAction] = useState<'on' | 'off'>(existingRule?.target_state ? 'on' : 'off');
  const {
    createRule,
    updateRule
  } = useAutomationRules();
  const handleSave = async () => {
    if (!time) {
      toast.error('Please select a time');
      return;
    }
    try {
      if (existingRule) {
        await updateRule.mutateAsync({
          id: existingRule.id,
          name: `${deviceName} - ${action === 'on' ? 'Turn On' : 'Turn Off'} at ${time}`,
          trigger_time: time,
          action: action === 'on' ? 'turn_on' : 'turn_off',
          target_state: action === 'on'
        });
      } else {
        await createRule.mutateAsync({
          name: `${deviceName} - ${action === 'on' ? 'Turn On' : 'Turn Off'} at ${time}`,
          device_id: deviceId,
          trigger_time: time,
          action: action === 'on' ? 'turn_on' : 'turn_off',
          target_state: action === 'on',
          is_enabled: true,
          days_of_week: [0, 1, 2, 3, 4, 5, 6]
        });
      }
      setOpen(false);
      setTime('');
      onClose?.();
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) onClose?.();
  };
  return <Dialog open={open} onOpenChange={handleOpenChange}>
      {!existingRule && <DialogTrigger asChild>
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
        </DialogTrigger>}
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>{existingRule ? 'Edit Schedule' : 'Set Schedule'}</DialogTitle>
          <DialogDescription>
            Automatically turn {deviceName} on or off at a specific time.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="schedule-time" className="text-right">
              Time
            </Label>
            <Input id="schedule-time" type="time" value={time} onChange={e => setTime(e.target.value)} className="col-span-3 rounded-lg" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-sm">Action</span>
            <div className="col-span-3 flex gap-2">
              <Button variant={action === 'on' ? 'default' : 'outline'} size="sm" onClick={() => setAction('on')} className="rounded-lg">
                Turn On
              </Button>
              <Button variant={action === 'off' ? 'default' : 'outline'} size="sm" onClick={() => setAction('off')} className="rounded-lg">
                Turn Off
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={createRule.isPending || updateRule.isPending} className="rounded-lg">
            {createRule.isPending || updateRule.isPending ? 'Saving...' : existingRule ? 'Update Schedule' : 'Save Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}
function ScheduleItem({
  rule,
  deviceName,
  onDelete
}: {
  rule: AutomationRule;
  deviceName: string;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (editing) {
    return <ScheduleDialog deviceId={rule.device_id} deviceName={deviceName} existingRule={rule} onClose={() => setEditing(false)} />;
  }
  return <>
      <div className="flex items-center justify-between py-1.5 px-2 bg-muted/50 rounded-lg text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span>{rule.target_state ? 'On' : 'Off'} at {formatTime(rule.trigger_time)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground" onClick={() => setEditing(true)}>
            <Pencil className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => setDeleteOpen(true)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
}
export function DeviceCard({
  device,
  onToggle,
  onValueChange,
  onEdit,
  onDelete,
  showControls = false,
  compact = false
}: DeviceCardProps) {
  const {
    theme
  } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const {
    rules,
    deleteRule
  } = useAutomationRules();

  // Get device rules
  const deviceRules = rules.filter(r => r.device_id === device.id && r.is_enabled);

  // Calculate next scheduled run
  const nextSchedule = (() => {
    if (!deviceRules.length) return null;
    const now = new Date();
    let nextRun: {
      date: Date;
      action: boolean;
    } | null = null;
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
            nextRun = {
              date: checkDate,
              action: rule.target_state ?? false
            };
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
    const timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    if (isToday) return `Today ${timeStr}`;
    if (isTomorrow) return `Tom ${timeStr}`;
    return `${date.toLocaleDateString([], {
      weekday: 'short'
    })} ${timeStr}`;
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
  const bgColorStyle = device.is_on && device.glow_color && isDark ? {
    backgroundColor: device.glow_color + '20'
  } : {};
  const cardStyle: React.CSSProperties & Record<string, string | undefined> = {
    '--glow-color': device.glow_color,
    ...bgColorStyle
  };
  return <Card className={cn("relative overflow-hidden transition-all duration-500 border-border/50 internal-glow rounded-xl", device.is_on && "glow-active internal-border-glow border-foreground/20", compact ? "min-h-[140px]" : "min-h-[120px]", "p-3")} style={cardStyle}>
      <CardContent className="relative z-10 p-0 h-full flex flex-col">
        {/* Room Name Header */}
        {device.room && <p className="text-xs text-muted-foreground mb-2 truncate text-left">
            {device.room.name}
          </p>}

        {/* Device Icon and Name - Centered */}
        <div className="flex-1 flex-col flex items-end justify-start gap-[5px]">
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", device.is_on ? "bg-foreground/10" : "bg-muted")} style={{
          color: device.is_on ? device.glow_color : undefined
        }}>
            <DeviceIcon type={device.device_type} className="w-5 h-5" />
          </div>
          
          {/* Next schedule indicator */}
          {nextSchedule && compact && <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {nextSchedule.action ? 'On' : 'Off'} {formatNextRun(nextSchedule.date)}
            </p>}
        </div>

        {/* Toggle Control - Centered at Bottom */}
        <div className="flex justify-center mt-2">
          <DeviceToggle isOn={device.is_on} style={device.toggle_style} glowColor={device.glow_color} onToggle={onToggle} value={device.brightness} onValueChange={onValueChange} step={device.slider_step || 10} />
        </div>

        {/* Schedules List (only on full cards) */}
        {showControls && !compact && deviceRules.length > 0 && <div className="mt-3 pt-2 border-t border-border/50 space-y-1.5">
            <p className="text-xs text-muted-foreground mb-1">Schedules</p>
            {deviceRules.map(rule => <ScheduleItem key={rule.id} rule={rule} deviceName={device.name} onDelete={() => deleteRule.mutate(rule.id)} />)}
          </div>}

        {/* Additional Controls (only on full cards, not compact Dashboard cards) */}
        {showControls && !compact && <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-border/50">
            <ScheduleDialog deviceId={device.id} deviceName={device.name} />
            
            {onEdit && <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onEdit} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>}
            
            {onDelete && <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onDelete} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>}
          </div>}
      </CardContent>
    </Card>;
}