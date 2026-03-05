import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { useDevices } from '@/hooks/useDevices';
import { Loader2, Calendar, Clock, Trash2, Pencil, X, Check, Power, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DAYS = [
  { value: 0, label: 'Sun', short: 'S' },
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' },
];

export default function Schedules() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAppAuth();
  const { rules, isLoading, deleteRule, updateRule, toggleRule, createRule } = useAutomationRules();
  const { devices } = useDevices();
  
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  
  // Edit form state
  const [editTime, setEditTime] = useState('');
  const [editAction, setEditAction] = useState<'on' | 'off'>('on');
  const [editDays, setEditDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  
  // Create form state
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newAction, setNewAction] = useState<'on' | 'off'>('on');
  const [newDays, setNewDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDays = (days: number[] | null) => {
    if (!days || days.length === 7) return 'Every day';
    if (days.length === 0) return 'Never';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(d => DAYS[d].label).join(', ');
  };

  const startEdit = (rule: typeof rules[0]) => {
    setEditingRule(rule.id);
    setEditTime(rule.trigger_time.slice(0, 5));
    setEditAction(rule.target_state ? 'on' : 'off');
    setEditDays(rule.days_of_week || [0, 1, 2, 3, 4, 5, 6]);
  };

  const saveEdit = async () => {
    if (!editingRule) return;
    const rule = rules.find(r => r.id === editingRule);
    if (!rule) return;

    try {
      await updateRule.mutateAsync({
        id: editingRule,
        trigger_time: editTime,
        target_state: editAction === 'on',
        action: editAction === 'on' ? 'turn_on' : 'turn_off',
        days_of_week: editDays,
        name: `${rule.device?.name || 'Device'} - ${editAction === 'on' ? 'Turn On' : 'Turn Off'} at ${editTime}`,
      });
      setEditingRule(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCreate = async () => {
    if (!newDeviceId || !newTime) {
      toast.error('Please select a device and time');
      return;
    }

    const device = devices.find(d => d.id === newDeviceId);
    
    try {
      await createRule.mutateAsync({
        name: `${device?.name || 'Device'} - ${newAction === 'on' ? 'Turn On' : 'Turn Off'} at ${newTime}`,
        device_id: newDeviceId,
        trigger_time: newTime,
        action: newAction === 'on' ? 'turn_on' : 'turn_off',
        target_state: newAction === 'on',
        is_enabled: true,
        days_of_week: newDays,
      });
      setCreateOpen(false);
      setNewDeviceId('');
      setNewTime('');
      setNewAction('on');
      setNewDays([0, 1, 2, 3, 4, 5, 6]);
    } catch (error) {
      // Error handled in hook
    }
  };

  const toggleDay = (day: number, days: number[], setDays: (d: number[]) => void) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day].sort());
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-foreground/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Schedules</h1>
              <p className="text-muted-foreground">
                {rules.length} automation {rules.length === 1 ? 'rule' : 'rules'}
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="rounded-xl">
            <Clock className="w-4 h-4 mr-2" />
            New Schedule
          </Button>
        </div>

        {/* Rules List */}
        {rules.length === 0 ? (
          <Card className="rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No schedules yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create schedules to automate your devices at specific times.
              </p>
              <Button onClick={() => setCreateOpen(true)} className="rounded-xl">
                Create Your First Schedule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <Card key={rule.id} className={cn("rounded-xl transition-all", !rule.is_enabled && "opacity-60")}>
                <CardContent className="p-4">
                  {editingRule === rule.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="rounded-lg mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Action</Label>
                          <div className="flex gap-2 mt-1">
                            <Button
                              variant={editAction === 'on' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setEditAction('on')}
                              className="rounded-lg flex-1"
                            >
                              <Power className="w-3 h-3 mr-1" />
                              On
                            </Button>
                            <Button
                              variant={editAction === 'off' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setEditAction('off')}
                              className="rounded-lg flex-1"
                            >
                              <PowerOff className="w-3 h-3 mr-1" />
                              Off
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Days</Label>
                        <div className="flex gap-1 mt-1">
                          {DAYS.map((day) => (
                            <button
                              key={day.value}
                              onClick={() => toggleDay(day.value, editDays, setEditDays)}
                              className={cn(
                                "w-9 h-9 rounded-lg text-xs font-medium transition-colors",
                                editDays.includes(day.value)
                                  ? "bg-foreground text-background"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
                            >
                              {day.short}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingRule(null)}
                          className="rounded-lg"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          disabled={updateRule.isPending}
                          className="rounded-lg"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={rule.is_enabled}
                        onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, is_enabled: checked })}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{rule.device?.name || 'Unknown Device'}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            rule.target_state 
                              ? "bg-green-500/20 text-green-500" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {rule.target_state ? 'Turn On' : 'Turn Off'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(rule.trigger_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDays(rule.days_of_week)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(rule)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteOpen(rule.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteOpen} onOpenChange={() => setDeleteOpen(null)}>
          <AlertDialogContent className="rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this schedule? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteOpen) deleteRule.mutate(deleteOpen);
                  setDeleteOpen(null);
                }}
                className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="rounded-xl">
            <DialogHeader>
              <DialogTitle>Create Schedule</DialogTitle>
              <DialogDescription>
                Set up an automated schedule for a device.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Device</Label>
                <Select value={newDeviceId} onValueChange={setNewDeviceId}>
                  <SelectTrigger className="rounded-lg mt-1">
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {devices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.name} {device.room && `(${device.room.name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="rounded-lg mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label>Action</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={newAction === 'on' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewAction('on')}
                      className="rounded-lg flex-1"
                    >
                      <Power className="w-3 h-3 mr-1" />
                      On
                    </Button>
                    <Button
                      variant={newAction === 'off' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewAction('off')}
                      className="rounded-lg flex-1"
                    >
                      <PowerOff className="w-3 h-3 mr-1" />
                      Off
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Repeat on</Label>
                <div className="flex gap-1 mt-1">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value, newDays, setNewDays)}
                      className={cn(
                        "w-9 h-9 rounded-lg text-xs font-medium transition-colors",
                        newDays.includes(day.value)
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={createRule.isPending}
                className="rounded-lg"
              >
                {createRule.isPending ? 'Creating...' : 'Create Schedule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
