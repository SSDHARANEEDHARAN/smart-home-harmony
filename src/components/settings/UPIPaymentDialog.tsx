import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle, Smartphone, Copy, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUBSCRIPTION_TIERS, SubscriptionTier, TierConfig } from '@/config/subscriptionTiers';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const UPI_ID = 'tharaneetharanss-1@okicici';
const PAYEE_NAME = 'SmartHome Premium';

function getUpiLink(amount: number, tierName: string) {
  return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${tierName} Plan - SmartHome`)}`;
}

interface UPIPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: (tier: SubscriptionTier) => void;
  currentTier?: SubscriptionTier;
}

export function UPIPaymentDialog({ open, onOpenChange, onPaymentComplete, currentTier }: UPIPaymentDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'select' | 'pay' | 'confirm'>('select');
  const [selectedTier, setSelectedTier] = useState<TierConfig | null>(null);

  const currentTierConfig = currentTier ? SUBSCRIPTION_TIERS.find(t => t.id === currentTier) : null;
  const currentTierIndex = currentTier ? SUBSCRIPTION_TIERS.findIndex(t => t.id === currentTier) : -1;

  const getUpgradePrice = (tier: TierConfig): number => {
    if (!currentTierConfig) return tier.price;
    return Math.max(0, tier.price - currentTierConfig.price);
  };

  const handleClose = () => {
    setStep('select');
    setSelectedTier(null);
    onOpenChange(false);
  };

  const handleSelectTier = (tier: TierConfig) => {
    setSelectedTier(tier);
    setStep('pay');
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied!');
  };

  const openUpiApp = () => {
    if (selectedTier) {
      window.location.href = getUpiLink(getUpgradePrice(selectedTier), selectedTier.name);
    }
  };

  const handleConfirmPayment = async () => {
    if (!user || !selectedTier) return;

    // Log the payment transaction
    await supabase.from('payment_transactions').insert({
      user_id: user.id,
      amount: selectedTier.price,
      currency: 'INR',
      payment_method: 'UPI',
      upi_id: UPI_ID,
      product: `subscription_${selectedTier.id}`,
      status: 'confirmed',
    });

    onPaymentComplete(selectedTier.id);
    toast.success(`🎉 ${selectedTier.name} Plan activated!`);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {step === 'select' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {currentTier ? 'Upgrade Your Plan' : 'Choose Your Plan'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {currentTier ? `Current: ${currentTierConfig?.name} — select a higher tier` : 'Select a subscription tier'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SUBSCRIPTION_TIERS.map((tier, index) => {
                const isCurrentTier = tier.id === currentTier;
                const isLowerTier = currentTierIndex >= 0 && index <= currentTierIndex;
                const upgradePrice = getUpgradePrice(tier);
                const isDisabled = isCurrentTier || (isLowerTier && !isCurrentTier);

                return (
                  <button
                    key={tier.id}
                    onClick={() => !isDisabled && handleSelectTier(tier)}
                    disabled={isDisabled}
                    className={cn(
                      "relative flex flex-col p-4 rounded-xl border-2 transition-all text-left",
                      isCurrentTier
                        ? "border-primary/50 bg-primary/5 opacity-70 cursor-default"
                        : isDisabled
                          ? "border-border/30 opacity-40 cursor-not-allowed"
                          : tier.badge === 'Popular'
                            ? "border-primary bg-primary/5 hover:scale-[1.02]"
                            : "border-border hover:border-primary/50 hover:scale-[1.02]"
                    )}
                  >
                    {isCurrentTier && (
                      <Badge variant="default" className="absolute -top-2 right-3 text-[9px]">
                        Current Plan
                      </Badge>
                    )}
                    {!isCurrentTier && tier.badge && (
                      <Badge variant="secondary" className="absolute -top-2 right-3 text-[9px]">
                        {tier.badge}
                      </Badge>
                    )}
                    <p className="font-semibold text-sm text-foreground">{tier.name}</p>
                    <div className="mt-2">
                      {currentTier && !isDisabled && upgradePrice !== tier.price ? (
                        <>
                          <span className="text-xs text-muted-foreground line-through mr-1">₹{tier.price.toLocaleString()}</span>
                          <span className="text-xl font-bold text-primary">₹{upgradePrice.toLocaleString()}</span>
                          <Badge variant="secondary" className="ml-1.5 text-[9px]">Upgrade</Badge>
                        </>
                      ) : (
                        <>
                          <span className="text-xl font-bold text-foreground">₹{tier.price.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">{tier.durationLabel}</span>
                        </>
                      )}
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <Button variant="ghost" onClick={handleClose} className="w-full mt-4 text-xs h-9">
              Maybe Later
            </Button>
          </div>
        )}

        {step === 'pay' && selectedTier && (
          <div className="flex flex-col sm:flex-row">
            {/* Left Side */}
            <div className="flex-1 p-6 bg-card border-r border-border">
              <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-xs gap-1" onClick={() => setStep('select')}>
                <ArrowLeft className="w-3 h-3" /> Change Plan
              </Button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {currentTier ? `Upgrade to ${selectedTier.name}` : `${selectedTier.name} Plan`}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedTier.duration} access</p>
                </div>
              </div>

              {(() => {
                const payAmount = getUpgradePrice(selectedTier);
                return (
                  <div className="p-4 bg-muted/50 rounded-lg mb-4">
                    <div className="text-2xl font-bold text-foreground">₹{payAmount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {currentTier && payAmount !== selectedTier.price
                        ? `Upgrade price (₹${selectedTier.price.toLocaleString()} − ₹${currentTierConfig!.price.toLocaleString()} paid)`
                        : 'One-time payment'
                      }
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border mb-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">UPI ID</p>
                  <p className="font-mono text-xs font-medium text-foreground">{UPI_ID}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyUpiId}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Includes</p>
                {selectedTier.features.map((f, i) => (
                  <BenefitRow key={i} text={f} />
                ))}
              </div>

              <Button variant="outline" className="w-full gap-2 text-xs h-9 sm:hidden" onClick={openUpiApp}>
                <Smartphone className="w-3.5 h-3.5" />
                Open UPI App
              </Button>
            </div>

            {/* Right Side - QR */}
            <div className="flex-1 p-6 bg-muted/20 flex flex-col items-center justify-center">
              <p className="text-xs text-muted-foreground mb-4">Scan with any UPI app</p>
              
              <div className="p-4 bg-white rounded-xl shadow-lg">
                <QRCodeSVG
                  value={getUpiLink(getUpgradePrice(selectedTier), selectedTier.name)}
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

        {step === 'confirm' && selectedTier && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Confirm Payment</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Confirm your {selectedTier.name} Plan payment
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border text-center mb-6">
              <p className="text-xs text-muted-foreground mb-1">Payment to</p>
              <p className="font-mono text-xs font-medium text-foreground">{UPI_ID}</p>
              <p className="text-xl font-bold text-foreground mt-2">₹{selectedTier.price.toLocaleString()}</p>
              <Badge variant="secondary" className="mt-2 text-[10px]">{selectedTier.name} - {selectedTier.duration}</Badge>
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
