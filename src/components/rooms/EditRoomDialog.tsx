import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as LucideIcons from 'lucide-react';
import { ROOM_ICONS, Room } from '@/types/smarthome';
import { useRooms } from '@/hooks/useRooms';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface EditRoomDialogProps {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoomDialog({ room, open, onOpenChange }: EditRoomDialogProps) {
  const { updateRoom } = useRooms();
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');

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
    setStep('edit');
  }, [room]);

  // Reset step when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('edit');
    }
  }, [open]);

  const changes = useMemo(() => {
    const result: { field: string; from: string; to: string }[] = [];
    
    if (formData.name !== room.name) {
      result.push({ field: 'Name', from: room.name, to: formData.name });
    }
    if (formData.icon !== (room.icon || 'Home')) {
      result.push({ field: 'Icon', from: room.icon || 'Home', to: formData.icon });
    }
    
    return result;
  }, [formData, room]);

  const hasChanges = changes.length > 0;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasChanges) {
      setStep('confirm');
    }
  };

  const handleConfirm = async () => {
    await updateRoom.mutateAsync({
      id: room.id,
      name: formData.name,
      icon: formData.icon,
    });
    onOpenChange(false);
  };

  const OldIcon = (LucideIcons as any)[room.icon || 'Home'];
  const NewIcon = (LucideIcons as any)[formData.icon];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'edit' ? 'Edit Room' : 'Confirm Changes'}
          </DialogTitle>
          {step === 'confirm' && (
            <DialogDescription>
              Review the changes you're about to make
            </DialogDescription>
          )}
        </DialogHeader>

        {step === 'edit' ? (
          <form onSubmit={handleNext} className="space-y-4 mt-4">
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
                disabled={!formData.name || !hasChanges}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Review Changes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="space-y-3">
              {changes.map((change) => (
                <div
                  key={change.field}
                  className="p-4 rounded-lg bg-muted/50 border border-border/50"
                >
                  <p className="text-sm text-muted-foreground mb-2">{change.field}</p>
                  <div className="flex items-center gap-3">
                    {change.field === 'Icon' ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 text-destructive">
                          <OldIcon className="w-5 h-5" />
                          <span className="text-sm">{change.from}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 text-primary">
                          <NewIcon className="w-5 h-5" />
                          <span className="text-sm">{change.to}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="px-3 py-2 rounded-md bg-destructive/10 text-destructive text-sm line-through">
                          {change.from}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="px-3 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium">
                          {change.to}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep('edit')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={updateRoom.isPending}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
