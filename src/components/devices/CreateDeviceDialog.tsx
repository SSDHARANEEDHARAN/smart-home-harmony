import { useState, useEffect } from 'react';
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
import { Plus } from 'lucide-react';
import { DeviceType, ToggleStyle, GLOW_COLORS, Room } from '@/types/smarthome';
import { useDevices } from '@/hooks/useDevices';
import { useHome } from '@/contexts/HomeContext';

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

interface CreateDeviceDialogProps {
  rooms: Room[];
  defaultRoomId?: string;
}

export function CreateDeviceDialog({ rooms, defaultRoomId }: CreateDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const { createDevice } = useDevices();
  const { homes, currentHomeId } = useHome();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    device_type: 'switch' as DeviceType,
    room_id: defaultRoomId || '',
    home_id: currentHomeId,
    glow_color: '#00ffff',
    toggle_style: 'switch' as ToggleStyle,
    power_consumption: 10,
    relay_pin: '' as string | number,
    slider_step: 10,
    api_endpoint: '',
  });

  // Filter rooms by selected workspace
  const filteredRooms = rooms.filter(room => 
    (room as any).home_id === formData.home_id || !(room as any).home_id
  );

  // Update home_id when currentHomeId changes and dialog opens
  useEffect(() => {
    if (open) {
      setFormData(prev => ({ ...prev, home_id: currentHomeId }));
    }
  }, [open, currentHomeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createDevice.mutateAsync({
      ...formData,
      description: formData.description || null,
      is_on: false,
      brightness: 100,
      speed: 0,
      temperature: 24,
      icon: 'power',
      relay_pin: formData.relay_pin ? Number(formData.relay_pin) : null,
      api_endpoint: formData.api_endpoint || null,
      slider_step: formData.slider_step,
      home_id: formData.home_id,
    } as any);

    setOpen(false);
    setFormData({
      name: '',
      description: '',
      device_type: 'switch',
      room_id: defaultRoomId || '',
      home_id: currentHomeId,
      glow_color: '#00ffff',
      toggle_style: 'switch',
      power_consumption: 10,
      relay_pin: '',
      slider_step: 10,
      api_endpoint: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <Plus className="w-4 h-4" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Device</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Device Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Living Room Light"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Main ceiling light"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Workspace</Label>
              <Select
                value={formData.home_id}
                onValueChange={(v) => {
                  setFormData({ ...formData, home_id: v, room_id: '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {homes.map((home) => (
                    <SelectItem key={home.id} value={home.id}>
                      {home.name}
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
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRooms.map((room) => (
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
              <Label>Device Type</Label>
              <Select
                value={formData.device_type}
                onValueChange={(v) => setFormData({ ...formData, device_type: v as DeviceType })}
              >
                <SelectTrigger>
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
              <Label>Toggle Style</Label>
              <Select
                value={formData.toggle_style}
                onValueChange={(v) => setFormData({ ...formData, toggle_style: v as ToggleStyle })}
              >
                <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label>Glow Color</Label>
            <Select
              value={formData.glow_color}
              onValueChange={(v) => setFormData({ ...formData, glow_color: v })}
            >
              <SelectTrigger>
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


          {formData.toggle_style === 'slider' && (
            <div className="space-y-2">
              <Label>Slider Step Size</Label>
              <Select
                value={formData.slider_step.toString()}
                onValueChange={(v) => setFormData({ ...formData, slider_step: Number(v) })}
              >
                <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="power">Power Consumption (Watts)</Label>
            <Input
              id="power"
              type="number"
              value={formData.power_consumption}
              onChange={(e) => setFormData({ ...formData, power_consumption: Number(e.target.value) })}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relay">Relay Pin (1-1000)</Label>
            <Input
              id="relay"
              type="number"
              value={formData.relay_pin}
              onChange={(e) => setFormData({ ...formData, relay_pin: e.target.value })}
              placeholder="Enter relay pin number"
              min={1}
              max={1000}
              required
            />
            <p className="text-xs text-muted-foreground">
              This pin will be triggered when the device is toggled
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_endpoint">API Endpoint (Optional)</Label>
            <Input
              id="api_endpoint"
              value={formData.api_endpoint}
              onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
              placeholder="http://192.168.1.100/mjpeg or sensor URL"
            />
            <p className="text-xs text-muted-foreground">
              MJPEG stream URL for cameras or data endpoint for sensors
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || !formData.room_id || createDevice.isPending}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Create Device
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
