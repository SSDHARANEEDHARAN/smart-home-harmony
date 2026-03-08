import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Code2, Sparkles, Crown, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { SUBSCRIPTION_TIERS, getTierConfig } from '@/config/subscriptionTiers';
import { ESP32Icon, RaspberryPiIcon, FirebaseIcon, RainMakerIcon, ThingSpeakIcon, MQTTIcon } from '@/components/home/IoTIcons';
import { UPIPaymentDialog } from './UPIPaymentDialog';

export function DeveloperModeSection() {
  const { settings, updateDeveloperModeSettings } = useSettings();
  const { user } = useAuth();
  const { 
    isPurchased, 
    isEnabled,
    isVerifying,
    subscriptionTier,
    subscriptionExpiresAt,
    activateSubscription,
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

  const tierConfig = subscriptionTier ? getTierConfig(subscriptionTier) : null;

  // Show skeleton while verifying
  if (isVerifying) {
    return (
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-2">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="h-2 w-10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50 overflow-hidden animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Code2 className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  Developer Mode
                  {tierConfig && (
                    <Badge variant="secondary" className="text-xs">
                      {tierConfig.name}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Advanced IoT integration capabilities</CardDescription>
              </div>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleDeveloperMode}
              disabled={!isPurchased && isEnabled}
            />
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

          {/* Subscription Status */}
          {isPurchased && tierConfig && (
            <>
              <Separator />
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <CheckCircle className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {tierConfig.name} Plan Active
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {subscriptionTier === 'ultimate' 
                      ? 'Lifetime access — never expires'
                      : subscriptionExpiresAt 
                        ? `Expires: ${new Date(subscriptionExpiresAt).toLocaleDateString()}`
                        : tierConfig.duration + ' access'
                    }
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Pricing Tiers for unpurchased users */}
          {!isPurchased && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-foreground" />
                  <span className="font-semibold text-sm text-foreground">Unlock Premium Platforms</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SUBSCRIPTION_TIERS.map((tier) => (
                    <div key={tier.id} className="relative p-3 rounded-lg border border-border bg-muted/30">
                      {tier.badge && (
                        <Badge variant="secondary" className="absolute -top-2 right-2 text-[9px]">{tier.badge}</Badge>
                      )}
                      <p className="font-semibold text-xs text-foreground">{tier.name}</p>
                      <p className="text-lg font-bold text-foreground mt-1">₹{tier.price.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{tier.duration}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full"
                  onClick={() => {
                    if (!user) { toast.error('Please log in first'); return; }
                    setShowPaymentDialog(true);
                  }}
                  disabled={!user}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {user ? 'Subscribe via UPI' : 'Login to Upgrade'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <UPIPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onPaymentComplete={async (tier) => {
          await activateSubscription(tier);
          setShowPaymentDialog(false);
        }}
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
