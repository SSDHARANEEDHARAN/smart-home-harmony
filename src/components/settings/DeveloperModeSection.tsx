import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Code2, Sparkles, Zap, Crown, CheckCircle, Lock } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function DeveloperModeSection() {
  const { settings, updateDeveloperModeSettings, activateDeveloperMode } = useSettings();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleDeveloperMode = (checked: boolean) => {
    if (checked && !settings.developerMode.paid) {
      setShowPaymentDialog(true);
    } else {
      updateDeveloperModeSettings({ enabled: checked });
      if (checked) {
        toast.success('Developer Mode enabled!');
      } else {
        toast.info('Developer Mode disabled');
      }
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    activateDeveloperMode();
    setShowPaymentDialog(false);
    setIsProcessing(false);
    toast.success('🎉 Developer Mode activated! Lifetime access unlocked.');
  };

  const isPaid = settings.developerMode.paid;
  const isEnabled = settings.developerMode.enabled;

  return (
    <>
      <Card className="border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 p-1">
          <CardHeader className="bg-card rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Developer Mode
                    {isPaid && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Advanced IoT integration capabilities</CardDescription>
                </div>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleDeveloperMode}
                disabled={!isPaid && isEnabled}
              />
            </div>
          </CardHeader>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureItem 
              icon={<Zap className="w-4 h-4" />}
              title="Platform Selection"
              description="Choose ESP32, Raspberry Pi, Firebase & more"
              locked={!isPaid}
            />
            <FeatureItem 
              icon={<Sparkles className="w-4 h-4" />}
              title="No-Code Integration"
              description="Easy setup without programming"
              locked={!isPaid}
            />
            <FeatureItem 
              icon={<Code2 className="w-4 h-4" />}
              title="Multi-Protocol Support"
              description="MQTT, ThingSpeak, RainMaker"
              locked={!isPaid}
            />
            <FeatureItem 
              icon={<Crown className="w-4 h-4" />}
              title="Lifetime Access"
              description="One-time payment, forever yours"
              locked={!isPaid}
            />
          </div>

          {!isPaid && (
            <>
              <Separator />
              
              {/* Premium Offer */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 p-6 border border-purple-500/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-foreground">Unlock Developer Mode</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get lifetime access to all developer features with a one-time payment. 
                    No subscriptions, no hidden fees.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-foreground">₹4,999</span>
                      <span className="text-muted-foreground ml-2 line-through">₹9,999</span>
                      <Badge variant="secondary" className="ml-2">50% OFF</Badge>
                    </div>
                    <Button 
                      onClick={() => setShowPaymentDialog(true)}
                      className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {isPaid && isEnabled && (
            <>
              <Separator />
              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm text-foreground">Developer Mode Active</p>
                  <p className="text-xs text-muted-foreground">
                    Create workspaces with platform selection enabled
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-center text-xl">Upgrade to Developer Mode</DialogTitle>
            <DialogDescription className="text-center">
              Unlock all premium features with a one-time payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Price */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-4xl font-bold text-foreground">₹4,999</div>
              <div className="text-sm text-muted-foreground">Lifetime Access</div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <BenefitRow text="Select from 6+ IoT platforms" />
              <BenefitRow text="No-code integration setup" />
              <BenefitRow text="Firebase, MQTT, ThingSpeak support" />
              <BenefitRow text="ESP32 & Raspberry Pi ready" />
              <BenefitRow text="Lifetime updates included" />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Pay ₹4,999 & Activate
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={() => setShowPaymentDialog(false)} className="w-full">
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FeatureItem({ 
  icon, 
  title, 
  description, 
  locked 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  locked: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${locked ? 'bg-muted/30 border-border/50' : 'bg-primary/5 border-primary/20'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${locked ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
        {locked ? <Lock className="w-4 h-4" /> : icon}
      </div>
      <div>
        <p className={`font-medium text-sm ${locked ? 'text-muted-foreground' : 'text-foreground'}`}>{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
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
