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
import { Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ROOM_ICONS } from '@/types/smarthome';
import { useRooms } from '@/hooks/useRooms';
import { useHome } from '@/contexts/HomeContext';
import { cn } from '@/lib/utils';

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const { createRoom } = useRooms();
  const { homes, currentHomeId } = useHome();

  const [formData, setFormData] = useState({
    name: '',
    icon: 'Home',
    home_id: currentHomeId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createRoom.mutateAsync({
      name: formData.name,
      icon: formData.icon,
      home_id: formData.home_id,
    });

    setOpen(false);
    setFormData({ name: '', icon: 'Home', home_id: currentHomeId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/10">
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Living Room"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Workspace</Label>
            <Select
              value={formData.home_id}
              onValueChange={(v) => setFormData({ ...formData, home_id: v })}
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
            <Label>Room Icon</Label>
            <div className="grid grid-cols-5 gap-2">
              {ROOM_ICONS.map((iconName) => {
                const IconComponent = (LucideIcons as any)[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                    className={cn(
                      "p-3 rounded-lg flex items-center justify-center transition-all",
                      formData.icon === iconName
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || createRoom.isPending}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Create Room
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
