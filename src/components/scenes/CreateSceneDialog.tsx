import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useScenes, DeviceState } from '@/hooks/useScenes';
import { Device } from '@/types/smarthome';
import * as LucideIcons from 'lucide-react';

const SCENE_ICONS = ['Zap', 'Sun', 'Moon', 'Film', 'Coffee', 'Bed', 'ShieldCheck', 'PartyPopper'];

interface CreateSceneDialogProps {
  devices: Device[];
}

export function CreateSceneDialog({ devices }: CreateSceneDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Zap');
  const [deviceStates, setDeviceStates] = useState<Record<string, { included: boolean; is_on: boolean }>>({});
  
  const { createScene } = useScenes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const states: DeviceState[] = Object.entries(deviceStates)
      .filter(([, state]) => state.included)
      .map(([deviceId, state]) => ({
        device_id: deviceId,
        is_on: state.is_on,
      }));

    if (states.length === 0) {
      return;
    }

    createScene.mutate({
      name,
      description: description || null,
      icon,
      device_states: states,
    });

    setOpen(false);
    setName('');
    setDescription('');
    setIcon('Zap');
    setDeviceStates({});
  };

  const toggleDeviceIncluded = (deviceId: string) => {
    setDeviceStates(prev => ({
      ...prev,
      [deviceId]: {
        included: !prev[deviceId]?.included,
        is_on: prev[deviceId]?.is_on ?? true,
      }
    }));
  };

  const toggleDeviceState = (deviceId: string) => {
    setDeviceStates(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        is_on: !prev[deviceId]?.is_on,
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Scene
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Scene</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Scene Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Good Morning"
              className="bg-muted border-border/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Wake up routine - lights on, coffee maker starts"
              className="bg-muted border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {SCENE_ICONS.map((iconName) => {
                const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
                return (
                  <Button
                    key={iconName}
                    type="button"
                    variant={icon === iconName ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setIcon(iconName)}
                    className="w-10 h-10"
                  >
                    <IconComponent className="w-5 h-5" />
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Devices & States</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {devices.map((device) => {
                const isIncluded = deviceStates[device.id]?.included || false;
                const targetState = deviceStates[device.id]?.is_on ?? true;
                
                return (
                  <div
                    key={device.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isIncluded ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isIncluded}
                        onChange={() => toggleDeviceIncluded(device.id)}
                        className="w-4 h-4"
                      />
                      <span className={isIncluded ? 'text-foreground' : 'text-muted-foreground'}>
                        {device.name}
                      </span>
                    </div>
                    {isIncluded && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {targetState ? 'ON' : 'OFF'}
                        </span>
                        <Switch
                          checked={targetState}
                          onCheckedChange={() => toggleDeviceState(device.id)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={createScene.isPending}>
            {createScene.isPending ? 'Creating...' : 'Create Scene'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
