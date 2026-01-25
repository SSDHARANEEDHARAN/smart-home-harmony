import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickScheduleButtonProps {
  deviceId: string;
  deviceName: string;
  className?: string;
  compact?: boolean;
}

const DAYS = [
  { value: 0, label: 'Sun', short: 'S' },
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' },
];

export function QuickScheduleButton({ 
  deviceId, 
  deviceName,
  className,
  compact = false
}: QuickScheduleButtonProps) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState('');
  const [action, setAction] = useState<'on' | 'off'>('on');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const { createRule } = useAutomationRules();

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSave = async () => {
    if (!time) {
      toast.error('Please select a time');
      return;
    }
    if (selectedDays.length === 0) {
      toast.error('Please select at least one day');
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
        days_of_week: selectedDays,
      });
      
      toast.success(`Schedule created for ${deviceName}`);
      setOpen(false);
      setTime('');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-7 w-7 text-muted-foreground hover:text-foreground", className)}
              >
                {/* Schedule/Calendar SVG Icon */}
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <circle cx="12" cy="15" r="2"/>
                  <path d="M12 13v-1"/>
                </svg>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quick Schedule</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Quick Schedule</h4>
            <p className="text-xs text-muted-foreground">
              Set a time to turn "{deviceName}" on or off
            </p>
          </div>

          {/* Time picker */}
          <div className="space-y-2">
            <Label className="text-xs">Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <Label className="text-xs">Action</Label>
            <div className="flex gap-2">
              <Button
                variant={action === 'on' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setAction('on')}
              >
                Turn On
              </Button>
              <Button
                variant={action === 'off' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setAction('off')}
              >
                Turn Off
              </Button>
            </div>
          </div>

          {/* Days selector */}
          <div className="space-y-2">
            <Label className="text-xs">Repeat on</Label>
            <div className="flex gap-1">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "flex-1 h-7 rounded text-[10px] font-medium transition-colors",
                    selectedDays.includes(day.value)
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={createRule.isPending}
          >
            {createRule.isPending ? 'Creating...' : 'Create Schedule'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
