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
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        {step === 'pay' && (
          <>
            <DialogHeader>
              <div className="mx-auto w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-2">
                <Crown className="w-5 h-5 text-foreground" />
              </div>
              <DialogTitle className="text-center text-sm">Pay via UPI</DialogTitle>
              <DialogDescription className="text-center text-xs">
                Scan the QR code or use UPI ID to pay
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {/* Price */}
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-foreground">₹{AMOUNT}</div>
                <div className="text-xs text-muted-foreground">Lifetime Access</div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center p-3 bg-white rounded-xl">
                <QRCodeSVG
                  value={UPI_LINK}
                  size={160}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              {/* UPI ID */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">UPI ID</p>
                  <p className="font-mono text-sm font-medium text-foreground">{UPI_ID}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyUpiId}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* Open UPI App Button */}
              <Button variant="outline" className="w-full gap-2" onClick={openUpiApp}>
                <Smartphone className="w-4 h-4" />
                Open GPay / PhonePe
              </Button>

              {/* Benefits */}
              <div className="space-y-2 pt-2">
                <BenefitRow text="Select from 6+ IoT platforms" />
                <BenefitRow text="No-code integration setup" />
                <BenefitRow text="Firebase, MQTT, ThingSpeak support" />
                <BenefitRow text="ESP32 & Raspberry Pi ready" />
                <BenefitRow text="Lifetime updates included" />
              </div>
            </div>

            <DialogFooter className="flex-col gap-2">
              <Button onClick={() => setStep('confirm')} className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                I've Completed Payment
              </Button>
              <Button variant="ghost" onClick={handleClose} className="w-full">
                Maybe Later
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-center text-xl">Confirm Payment</DialogTitle>
              <DialogDescription className="text-center">
                Please confirm that you have successfully completed the UPI payment of ₹{AMOUNT}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Payment to</p>
                <p className="font-mono text-sm font-medium text-foreground">{UPI_ID}</p>
                <p className="text-lg font-bold text-foreground mt-2">₹{AMOUNT}</p>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By confirming, you acknowledge that the payment has been completed successfully.
              </p>
            </div>

            <DialogFooter className="flex-col gap-2">
              <Button onClick={handleConfirmPayment} className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm & Activate
              </Button>
              <Button variant="ghost" onClick={() => setStep('pay')} className="w-full">
                Go Back
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BenefitRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}
