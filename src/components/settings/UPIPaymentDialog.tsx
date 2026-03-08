import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle, Smartphone, Copy, ExternalLink } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const UPI_ID = 'tharaneetharanss-1@okicici';
const AMOUNT = '4999';
const PAYEE_NAME = 'SmartHome Developer Mode';

// UPI deep link format
const UPI_LINK = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent('Developer Mode - Lifetime Access')}`;

interface UPIPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: () => void;
}

export function UPIPaymentDialog({ open, onOpenChange, onPaymentComplete }: UPIPaymentDialogProps) {
  const { activateDeveloperMode } = useSettings();
  const { user } = useAuth();
  const [step, setStep] = useState<'pay' | 'confirm'>('pay');

  const handleClose = () => {
    setStep('pay');
    onOpenChange(false);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied!');
  };

  const openUpiApp = () => {
    window.location.href = UPI_LINK;
  };

  const handleConfirmPayment = async () => {
    // Log the payment transaction
    if (user) {
      await supabase.from('payment_transactions').insert({
        user_id: user.id,
        amount: Number(AMOUNT),
        currency: 'INR',
        payment_method: 'UPI',
        upi_id: UPI_ID,
        product: 'developer_mode',
        status: 'confirmed',
      } as any);
    }
    activateDeveloperMode();
    toast.success('🎉 Developer Mode activated! Lifetime access unlocked.');
    handleClose();
    onPaymentComplete();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {step === 'pay' && (
          <div className="flex flex-col sm:flex-row">
            {/* Left Side - Payment Info & Status */}
            <div className="flex-1 p-6 bg-card border-r border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Developer Mode</h3>
                  <p className="text-xs text-muted-foreground">Lifetime Access</p>
                </div>
              </div>

              {/* Price Display */}
              <div className="p-4 bg-muted/50 rounded-lg mb-4">
                <div className="text-2xl font-bold text-foreground">₹{AMOUNT}</div>
                <div className="text-xs text-muted-foreground">One-time payment</div>
              </div>

              {/* UPI ID */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border mb-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">UPI ID</p>
                  <p className="font-mono text-xs font-medium text-foreground">{UPI_ID}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyUpiId}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Benefits */}
              <div className="space-y-2 mb-6">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Includes</p>
                <BenefitRow text="6+ IoT platform support" />
                <BenefitRow text="ESP32 & Raspberry Pi" />
                <BenefitRow text="Firebase & MQTT" />
                <BenefitRow text="Lifetime updates" />
              </div>

              {/* Mobile UPI Button */}
              <Button variant="outline" className="w-full gap-2 text-xs h-9 sm:hidden" onClick={openUpiApp}>
                <Smartphone className="w-3.5 h-3.5" />
                Open UPI App
              </Button>
            </div>

            {/* Right Side - QR Code */}
            <div className="flex-1 p-6 bg-muted/20 flex flex-col items-center justify-center">
              <p className="text-xs text-muted-foreground mb-4">Scan with any UPI app</p>
              
              <div className="p-4 bg-white rounded-xl shadow-lg">
                <QRCodeSVG
                  value={UPI_LINK}
                  size={180}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              <div className="mt-6 w-full space-y-2">
                <Button onClick={() => setStep('confirm')} className="w-full text-xs h-9">
                  <CheckCircle className="w-3.5 h-3.5 mr-2" />
                  I've Completed Payment
                </Button>
                <Button variant="ghost" onClick={handleClose} className="w-full text-xs h-9">
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Confirm Payment</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Please confirm that you have completed the UPI payment
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border text-center mb-6">
              <p className="text-xs text-muted-foreground mb-1">Payment to</p>
              <p className="font-mono text-xs font-medium text-foreground">{UPI_ID}</p>
              <p className="text-xl font-bold text-foreground mt-2">₹{AMOUNT}</p>
            </div>

            <p className="text-[10px] text-muted-foreground text-center mb-4">
              By confirming, you acknowledge that the payment has been completed successfully.
            </p>

            <div className="space-y-2">
              <Button onClick={handleConfirmPayment} className="w-full text-xs h-9">
                <CheckCircle className="w-3.5 h-3.5 mr-2" />
                Confirm & Activate
              </Button>
              <Button variant="ghost" onClick={() => setStep('pay')} className="w-full text-xs h-9">
                Go Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BenefitRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
      <span className="text-xs text-foreground">{text}</span>
    </div>
  );
}
