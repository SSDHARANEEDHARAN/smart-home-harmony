import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Terminal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const PASSKEY = '12345678';

export function TerminalAccess() {
  const [passkey, setPasskey] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passkey === PASSKEY) {
      // Open terminal in new tab
      window.open('/terminal', '_blank');
      setOpen(false);
      setPasskey('');
      toast.success('Terminal access granted');
    } else {
      toast.error('Invalid passkey');
      setPasskey('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto gap-2">
          <Terminal className="w-4 h-4" />
          Terminal Platform
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Terminal Access
          </DialogTitle>
          <DialogDescription>
            Enter your passkey to access the relay control terminal
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passkey">Passkey</Label>
            <Input
              id="passkey"
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter 8-digit passkey"
              maxLength={8}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full">
            Access Terminal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
