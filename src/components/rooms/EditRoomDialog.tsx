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
import * as LucideIcons from 'lucide-react';
import { ROOM_ICONS, Room } from '@/types/smarthome';
import { useRooms } from '@/hooks/useRooms';
import { cn } from '@/lib/utils';

interface EditRoomDialogProps {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoomDialog({ room, open, onOpenChange }: EditRoomDialogProps) {
  const { updateRoom } = useRooms();

  const [formData, setFormData] = useState({
    name: room.name,
    icon: room.icon || 'Home',
  });

  // Sync form data when room changes
  useEffect(() => {
    setFormData({
      name: room.name,
      icon: room.icon || 'Home',
    });
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateRoom.mutateAsync({
      id: room.id,
      name: formData.name,
      icon: formData.icon,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-room-name">Room Name</Label>
            <Input
              id="edit-room-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Living Room"
              required
            />
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || updateRoom.isPending}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
