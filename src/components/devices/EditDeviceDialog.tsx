import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Device, DeviceType, ToggleStyle, GLOW_COLORS, Room } from '@/types/smarthome';
import { useDevices } from '@/hooks/useDevices';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'switch', label: 'Switch' },
  { value: 'fan', label: 'Fan' },
  { value: 'ac', label: 'AC' },
  { value: 'heater', label: 'Heater' },
  { value: 'camera', label: 'Camera' },
  { value: 'lock', label: 'Lock' },
  { value: 'sensor', label: 'Sensor' },
  { value: 'tv', label: 'TV' },
  { value: 'appliance', label: 'Appliance' },
];

const TOGGLE_STYLES: { value: ToggleStyle; label: string }[] = [
  { value: 'switch', label: 'Toggle Switch' },
  { value: 'slider', label: 'Brightness Slider' },
  { value: 'button', label: 'Power Button' },
];

interface EditDeviceDialogProps {
  device: Device;
  rooms: Room[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDeviceDialog({ device, rooms, open, onOpenChange }: EditDeviceDialogProps) {
  const { updateDevice } = useDevices();
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');

  const [formData, setFormData] = useState({
    name: device.name,
    description: (device as any).description || '',
    device_type: device.device_type,
    room_id: device.room_id,
    glow_color: device.glow_color || '#00ffff',
    toggle_style: device.toggle_style || 'switch',
    power_consumption: device.power_consumption || 10,
    relay_pin: device.relay_pin?.toString() || '',
    slider_step: device.slider_step || 10,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: device.name,
        description: (device as any).description || '',
        device_type: device.device_type,
        room_id: device.room_id,
        glow_color: device.glow_color || '#00ffff',
        toggle_style: device.toggle_style || 'switch',
        power_consumption: device.power_consumption || 10,
        relay_pin: device.relay_pin?.toString() || '',
        slider_step: device.slider_step || 10,
      });
      setStep('edit');
    }
  }, [device, open]);

  const changes = {
    name: formData.name !== device.name,
    description: formData.description !== ((device as any).description || ''),
    device_type: formData.device_type !== device.device_type,
    room_id: formData.room_id !== device.room_id,
    glow_color: formData.glow_color !== (device.glow_color || '#00ffff'),
    toggle_style: formData.toggle_style !== (device.toggle_style || 'switch'),
    power_consumption: formData.power_consumption !== (device.power_consumption || 10),
    relay_pin: formData.relay_pin !== (device.relay_pin?.toString() || ''),
    slider_step: formData.slider_step !== (device.slider_step || 10),
  };

  const hasChanges = Object.values(changes).some(Boolean);

  const handleSubmit = async () => {
    if (step === 'edit') {
      if (hasChanges) {
        setStep('confirm');
      }
      return;
    }

    await updateDevice.mutateAsync({
      id: device.id,
      name: formData.name,
      device_type: formData.device_type,
      room_id: formData.room_id,
      glow_color: formData.glow_color,
      toggle_style: formData.toggle_style as ToggleStyle,
      power_consumption: formData.power_consumption,
      relay_pin: formData.relay_pin ? Number(formData.relay_pin) : null,
      slider_step: formData.slider_step,
    });

    onOpenChange(false);
  };

  const getRoomName = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.name || 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 rounded-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'edit' ? 'Edit Device' : 'Review Changes'}
          </DialogTitle>
        </DialogHeader>

        {step === 'edit' ? (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Device Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Device name"
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the device..."
                className="rounded-lg resize-none h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Device Type</Label>
                <Select
                  value={formData.device_type}
                  onValueChange={(v) => setFormData({ ...formData, device_type: v as DeviceType })}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room</Label>
                <Select
                  value={formData.room_id}
                  onValueChange={(v) => setFormData({ ...formData, room_id: v })}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Toggle Style</Label>
                <Select
                  value={formData.toggle_style}
                  onValueChange={(v) => setFormData({ ...formData, toggle_style: v as ToggleStyle })}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOGGLE_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Glow Color</Label>
                <Select
                  value={formData.glow_color}
                  onValueChange={(v) => setFormData({ ...formData, glow_color: v })}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GLOW_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-power">Power (Watts)</Label>
                <Input
                  id="edit-power"
                  type="number"
                  value={formData.power_consumption}
                  onChange={(e) => setFormData({ ...formData, power_consumption: Number(e.target.value) })}
                  min={0}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-relay">Relay Pin (1-1000)</Label>
                <Input
                  id="edit-relay"
                  type="number"
                  value={formData.relay_pin}
                  onChange={(e) => setFormData({ ...formData, relay_pin: e.target.value })}
                  placeholder="Relay pin"
                  min={1}
                  max={1000}
                  className="rounded-lg"
                />
              </div>
            </div>

            {formData.toggle_style === 'slider' && (
              <div className="space-y-2">
                <Label>Slider Step Size</Label>
                <Select
                  value={formData.slider_step.toString()}
                  onValueChange={(v) => setFormData({ ...formData, slider_step: Number(v) })}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Amount to change per arrow click
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!hasChanges || !formData.name}
                className="gap-2 rounded-lg"
              >
                Review Changes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="space-y-3 p-4 bg-muted/30 border border-border/50 rounded-lg">
              {changes.name && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">{device.name}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium">{formData.name}</span>
                  </div>
                </div>
              )}
              {changes.description && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground truncate max-w-20">
                      {(device as any).description || 'None'}
                    </span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium truncate max-w-20">{formData.description || 'None'}</span>
                  </div>
                </div>
              )}
              {changes.device_type && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">{device.device_type}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium">{formData.device_type}</span>
                  </div>
                </div>
              )}
              {changes.room_id && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Room:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">{getRoomName(device.room_id)}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium">{getRoomName(formData.room_id)}</span>
                  </div>
                </div>
              )}
              {changes.relay_pin && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Relay Pin:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">{device.relay_pin || 'None'}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium">{formData.relay_pin || 'None'}</span>
                  </div>
                </div>
              )}
              {changes.glow_color && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Glow Color:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: device.glow_color || '#00ffff' }} />
                    <ArrowRight className="w-3 h-3" />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.glow_color }} />
                  </div>
                </div>
              )}
              {changes.toggle_style && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Toggle Style:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">{device.toggle_style || 'switch'}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium">{formData.toggle_style}</span>
                  </div>
                </div>
              )}
              {changes.power_consumption && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Power:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">{device.power_consumption || 10}W</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium">{formData.power_consumption}W</span>
                  </div>
                </div>
              )}
              {changes.slider_step && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Slider Step:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">{device.slider_step || 10}%</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium">{formData.slider_step}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep('edit')} className="gap-2 rounded-lg">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateDevice.isPending}
                className="gap-2 rounded-lg"
              >
                <Check className="w-4 h-4" />
                Confirm Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
