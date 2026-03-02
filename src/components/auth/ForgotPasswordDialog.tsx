import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { z } from 'zod';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export type ForgotPasswordProvider = 'supabase' | 'firebase';

type Step = 'email' | 'otp' | 'new-password' | 'done';

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  provider,
  onReset,
  onVerifyOtp,
  onUpdatePassword,
  defaultEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ForgotPasswordProvider;
  defaultEmail?: string;
  onReset: (email: string) => Promise<{ error: any | null }>;
  onVerifyOtp?: (email: string, token: string) => Promise<{ data: any; error: any | null }>;
  onUpdatePassword?: (password: string) => Promise<{ error: any | null }>;
}) {
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<Step>('email');

  const providerLabel = useMemo(() => (provider === 'firebase' ? 'Firebase' : 'App Account'), [provider]);
  const isOtpFlow = provider === 'supabase' && !!onVerifyOtp && !!onUpdatePassword;

  const resetState = () => {
    setStep('email');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSubmitting(false);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) resetState();
    onOpenChange(val);
  };

  // Step 1: Send OTP / reset link
  const submitEmail = async (e: React.FormEvent) => {
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

      if (isOtpFlow) {
        toast.success('OTP sent to your email');
        setStep('otp');
      } else {
        toast.success(`Password reset email sent (${providerLabel})`);
        handleOpenChange(false);
      }
    } catch {
      setError('Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setSubmitting(true);
    try {
      const { error: verifyError } = await onVerifyOtp!(email, otp);
      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired code');
        return;
      }
      setStep('new-password');
    } catch {
      setError('Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Set new password
  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      passwordSchema.parse(newPassword);
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.errors[0]?.message ?? 'Invalid password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await onUpdatePassword!(newPassword);
      if (updateError) {
        setError(updateError.message || 'Failed to update password');
        return;
      }
      setStep('done');
      toast.success('Password updated successfully!');
    } catch {
      setError('Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitle = {
    email: 'Forgot password',
    otp: 'Enter verification code',
    'new-password': 'Set new password',
    done: 'Password updated',
  };

  const stepDescription = {
    email: `Enter your email to receive a ${isOtpFlow ? '6-digit verification code' : 'password reset link'} for ${providerLabel}.`,
    otp: `We sent a 6-digit code to ${email}. Enter it below.`,
    'new-password': 'Choose a new password for your account.',
    done: 'Your password has been changed. You can now sign in.',
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass border-border/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== 'email' && step !== 'done' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setError('');
                  setStep(step === 'new-password' ? 'otp' : 'email');
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {stepTitle[step]}
          </DialogTitle>
          <DialogDescription>{stepDescription[step]}</DialogDescription>
        </DialogHeader>

        {step === 'email' && (
          <form onSubmit={submitEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Sending…' : isOtpFlow ? 'Send Code' : 'Send Link'}</Button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={submitOtp} className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <KeyRound className="w-8 h-8 text-primary" />
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button
              type="button"
              onClick={async () => {
                setSubmitting(true);
                await onReset(email);
                setSubmitting(false);
                toast.success('New code sent');
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              Didn't receive it? Resend code
            </button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting || otp.length !== 6}>
              {submitting ? 'Verifying…' : 'Verify Code'}
            </Button>
          </form>
        )}

        {step === 'new-password' && (
          <form onSubmit={submitNewPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pl-10" required />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <Button onClick={() => handleOpenChange(false)} className="w-full">Back to Sign In</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
