import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Code2, Sparkles, Zap, Crown, CheckCircle, Lock, Loader2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ESP32Icon, RaspberryPiIcon, FirebaseIcon, RainMakerIcon, ThingSpeakIcon, MQTTIcon } from '@/components/home/IoTIcons';
import { UPIPaymentDialog } from './UPIPaymentDialog';

export function DeveloperModeSection() {
  const { settings, updateDeveloperModeSettings } = useSettings();
  const { user } = useAuth();
  const { 
    isPurchased, 
    isEnabled,
    isVerifying, 
    verifyPurchase
  } = useDeveloperMode();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const handleToggleDeveloperMode = (checked: boolean) => {
    if (checked && !isPurchased) {
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

  const handlePaymentComplete = () => {
    setShowPaymentDialog(false);
  };

  useEffect(() => {
    if (user && !isPurchased) {
      verifyPurchase(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isPurchased]);

  return (
    <>
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Code2 className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                    Developer Mode
                    {isPurchased && (
                      <Badge variant="secondary" className="text-xs">
                        Premium
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Advanced IoT integration capabilities</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isVerifying && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleDeveloperMode}
                disabled={(!isPurchased && isEnabled) || isVerifying}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Platform Icons Grid */}
          <div className="grid grid-cols-6 gap-3">
            <PlatformIconCard icon={ESP32Icon} name="ESP32" />
            <PlatformIconCard icon={RaspberryPiIcon} name="Raspberry Pi" />
            <PlatformIconCard icon={FirebaseIcon} name="Firebase" />
            <PlatformIconCard icon={RainMakerIcon} name="RainMaker" />
            <PlatformIconCard icon={ThingSpeakIcon} name="ThingSpeak" />
            <PlatformIconCard icon={MQTTIcon} name="MQTT" />
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureItem 
              icon={<Zap className="w-4 h-4" />}
              title="Platform Selection"
              description="Choose ESP32, Raspberry Pi, Firebase & more"
              locked={!isPurchased}
            />
            <FeatureItem 
              icon={<Sparkles className="w-4 h-4" />}
              title="No-Code Integration"
              description="Easy setup without programming"
              locked={!isPurchased}
            />
            <FeatureItem 
              icon={<Code2 className="w-4 h-4" />}
              title="Multi-Protocol Support"
              description="MQTT, ThingSpeak, RainMaker"
              locked={!isPurchased}
            />
            <FeatureItem 
              icon={<Crown className="w-4 h-4" />}
              title="Lifetime Access"
              description="One-time payment, forever yours"
              locked={!isPurchased}
            />
          </div>

          {!isPurchased && (
            <>
              <Separator />
              
              {/* Premium Offer */}
              <div className="relative overflow-hidden rounded-xl bg-muted/50 p-6 border border-border">
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-foreground" />
                    <span className="font-semibold text-foreground">Unlock Developer Mode</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get lifetime access to all developer features with a one-time payment. 
                    No subscriptions, no hidden fees.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-foreground">₹4,999</span>
                      <span className="text-muted-foreground ml-2 line-through">₹9,999</span>
                      <Badge variant="secondary" className="ml-2">50% OFF</Badge>
                    </div>
                    <Button 
                      onClick={() => {
                        if (!user) {
                          toast.error('Please log in first');
                          return;
                        }
                        setShowPaymentDialog(true);
                      }}
                      disabled={!user}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {user ? 'Pay via UPI' : 'Login to Upgrade'}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {isPurchased && isEnabled && (
            <>
              <Separator />
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <CheckCircle className="w-5 h-5 text-primary" />
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

      {/* UPI Payment Dialog */}
      <UPIPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
}

function PlatformIconCard({ icon: Icon, name }: { icon: React.FC<{ className?: string }>; name: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-transparent hover:bg-muted/50 transition-colors">
      <Icon className="w-8 h-8 text-foreground" />
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{name}</span>
    </div>
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
