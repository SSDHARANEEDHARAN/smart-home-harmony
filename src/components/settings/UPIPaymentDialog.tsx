import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle, Smartphone, Copy, ArrowLeft, Upload, Loader2, FileCheck, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUBSCRIPTION_TIERS, SubscriptionTier, TierConfig } from '@/config/subscriptionTiers';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { generateInvoicePDF } from '@/utils/invoiceGenerator';

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

type Step = 'select' | 'pay' | 'upload' | 'transferring' | 'confirmed';

export function UPIPaymentDialog({ open, onOpenChange, onPaymentComplete, currentTier }: UPIPaymentDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('select');
  const [selectedTier, setSelectedTier] = useState<TierConfig | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTierConfig = currentTier ? SUBSCRIPTION_TIERS.find(t => t.id === currentTier) : null;
  const currentTierIndex = currentTier ? SUBSCRIPTION_TIERS.findIndex(t => t.id === currentTier) : -1;

  const getUpgradePrice = (tier: TierConfig): number => {
    if (!currentTierConfig) return tier.price;
    return Math.max(0, tier.price - currentTierConfig.price);
  };

  const handleClose = () => {
    setStep('select');
    setSelectedTier(null);
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setIsUploading(false);
    setTransactionId(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadAndConfirm = async () => {
    if (!user || !selectedTier || !screenshotFile) return;

    setIsUploading(true);

    try {
      // Upload screenshot
      const fileName = `${user.id}/${Date.now()}_${screenshotFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, screenshotFile);

      if (uploadError) throw uploadError;

      const screenshotUrl = fileName;
      const payAmount = getUpgradePrice(selectedTier);

      // Log transaction
      const { data: txn, error: txnError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          amount: payAmount,
          currency: 'INR',
          payment_method: 'UPI',
          upi_id: UPI_ID,
          product: `subscription_${selectedTier.id}`,
          status: 'processing',
          screenshot_url: screenshotUrl,
        })
        .select('id')
        .single();

      if (txnError) throw txnError;
      setTransactionId(txn.id);

      // Move to transferring state
      setStep('transferring');

      // Auto-approve after 3 seconds (trust-based)
      setTimeout(async () => {
        // Update transaction status
        await supabase
          .from('payment_transactions')
          .update({ status: 'confirmed' })
          .eq('id', txn.id);

        setStep('confirmed');

        // Activate subscription
        onPaymentComplete(selectedTier.id);
      }, 3000);

    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
      setIsUploading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!user || !selectedTier || !transactionId) return;

    try {
      const payAmount = getUpgradePrice(selectedTier);
      await generateInvoicePDF({
        transactionId,
        tierName: selectedTier.name,
        amount: payAmount,
        currency: 'INR',
        duration: selectedTier.duration,
        userEmail: user.email || '',
        paymentMethod: 'UPI',
        date: new Date(),
      });
      toast.success('Invoice downloaded!');
    } catch (err) {
      toast.error('Failed to generate invoice');
    }
  };

  // Auto-download invoice when confirmed
  useEffect(() => {
    if (step === 'confirmed' && transactionId) {
      const timer = setTimeout(() => handleDownloadInvoice(), 1500);
      return () => clearTimeout(timer);
    }
  }, [step, transactionId]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* STEP 1: Select Tier */}
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

        {/* STEP 2: QR Code + Pay */}
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

            {/* Right Side - QR + Upload */}
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

              <div className="mt-6 w-full space-y-3">
                {/* Screenshot upload area */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {screenshotPreview ? (
                  <div className="relative rounded-lg border-2 border-primary/50 overflow-hidden">
                    <img src={screenshotPreview} alt="Payment screenshot" className="w-full h-32 object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2">
                      <FileCheck className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] text-foreground truncate">{screenshotFile?.name}</span>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2 right-2 bg-background/80 rounded-full p-1"
                    >
                      <Upload className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload payment screenshot</span>
                  </button>
                )}

                <Button
                  onClick={handleUploadAndConfirm}
                  disabled={!screenshotFile || isUploading}
                  className="w-full text-xs h-9"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 mr-2" />
                  )}
                  {screenshotFile ? 'I have Completed Payment' : 'Upload screenshot to continue'}
                </Button>

                <Button variant="ghost" onClick={handleClose} className="w-full text-xs h-9">
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Transferring (blinking animation) */}
        {step === 'transferring' && selectedTier && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 animate-ping" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2 animate-pulse">
              Transferring...
            </h3>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Verifying your payment of <span className="font-semibold text-foreground">₹{getUpgradePrice(selectedTier).toLocaleString()}</span> for the {selectedTier.name} Plan.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* STEP 4: Confirmed + Invoice */}
        {step === 'confirmed' && selectedTier && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-in zoom-in-50 duration-500">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Payment Received!</h3>
            <p className="text-xs text-muted-foreground text-center max-w-xs mb-1">
              Your <span className="font-semibold text-foreground">{selectedTier.name}</span> Plan has been activated successfully.
            </p>
            <Badge variant="secondary" className="text-[10px] mb-6">
              {selectedTier.duration === 'Perpetual' ? 'Lifetime Access' : `Valid for ${selectedTier.duration}`}
            </Badge>

            <div className="p-4 bg-muted/50 rounded-lg border border-border w-full max-w-xs mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">₹{getUpgradePrice(selectedTier).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-foreground">{selectedTier.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default" className="text-[9px] bg-green-500 hover:bg-green-500">Confirmed</Badge>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground mb-4 flex items-center gap-1">
              <Download className="w-3 h-3" /> Invoice auto-downloading...
            </p>

            <div className="w-full max-w-xs space-y-2">
              <Button onClick={handleDownloadInvoice} variant="outline" className="w-full text-xs h-9 gap-2">
                <Download className="w-3.5 h-3.5" />
                Download Invoice
              </Button>
              <Button onClick={handleClose} className="w-full text-xs h-9">
                Done
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
