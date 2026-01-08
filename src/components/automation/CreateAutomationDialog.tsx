import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { Device } from '@/types/smarthome';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { cn } from '@/lib/utils';

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

interface CreateAutomationDialogProps {
  devices: Device[];
}

export function CreateAutomationDialog({ devices }: CreateAutomationDialogProps) {
  const [open, setOpen] = useState(false);
  const { createRule } = useAutomationRules();

  const [formData, setFormData] = useState({
    name: '',
    device_id: '',
    trigger_time: '07:00',
    target_state: true,
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createRule.mutateAsync({
      ...formData,
      action: 'toggle',
      is_enabled: true,
    });

    setOpen(false);
    setFormData({
      name: '',
      device_id: '',
      trigger_time: '07:00',
      target_state: true,
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
    });
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day].sort(),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <Plus className="w-4 h-4" />
          Add Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Automation Rule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule Name</Label>
            <Input
              id="rule-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Morning Lights"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Device</Label>
            <Select
              value={formData.device_id}
              onValueChange={(v) => setFormData({ ...formData, device_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name} ({device.room?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Trigger Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.trigger_time}
                onChange={(e) => setFormData({ ...formData, trigger_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Target State</Label>
              <div className="flex items-center gap-3 h-10">
                <span className="text-sm text-muted-foreground">OFF</span>
                <Switch
                  checked={formData.target_state}
                  onCheckedChange={(checked) => setFormData({ ...formData, target_state: checked })}
                />
                <span className="text-sm text-muted-foreground">ON</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Active Days</Label>
            <div className="flex gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    formData.days_of_week.includes(day.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || !formData.device_id || formData.days_of_week.length === 0 || createRule.isPending}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Create Rule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
