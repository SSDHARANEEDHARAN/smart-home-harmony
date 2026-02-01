import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

export type ForgotPasswordProvider = 'supabase' | 'firebase';

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  provider,
  onReset,
  defaultEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ForgotPasswordProvider;
  defaultEmail?: string;
  onReset: (email: string) => Promise<{ error: any | null }>; // keep flexible for both SDKs
}) {
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const providerLabel = useMemo(() => (provider === 'firebase' ? 'Firebase' : 'App Account'), [provider]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.errors[0]?.message ?? 'Invalid email');
      return;
    }

    setSubmitting(true);
    try {
      const { error: resetError } = await onReset(email);
      if (resetError) {
        setError(resetError.message || 'Failed to send reset email');
        return;
      }

      toast.success(`Password reset email sent (${providerLabel})`);
      onOpenChange(false);
    } catch {
      setError('Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle>Forgot password</DialogTitle>
          <DialogDescription>
            Enter your email to receive a password reset link for <span className="font-medium">{providerLabel}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
