import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { 
  Wifi, 
  WifiOff, 
  Router, 
  RefreshCw, 
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Signal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function OfflineModePanel() {
  const { 
    config, 
    enableOfflineMode, 
    disableOfflineMode, 
    setDeviceIp, 
    pingDevice,
    DEFAULT_DEVICE_IP 
  } = useOfflineMode();
  const { isConnected: firebaseConnected, hasFirebaseConfig } = useFirebaseSync();
  const [customIp, setCustomIp] = useState(config.deviceIp);
  const [isPinging, setIsPinging] = useState(false);

  const handleToggleOfflineMode = () => {
    if (config.enabled) {
      disableOfflineMode();
    } else {
      enableOfflineMode(customIp);
    }
  };

  const handlePing = async () => {
    setIsPinging(true);
    const success = await pingDevice();
    setIsPinging(false);
    
    if (success) {
      toast.success('Device is reachable!');
    } else {
      toast.error('Could not reach device');
    }
  };

  const handleIpChange = (ip: string) => {
    setCustomIp(ip);
    if (config.enabled) {
      setDeviceIp(ip);
    }
  };

  // Determine overall connection status
  const getConnectionStatus = () => {
    if (config.enabled && config.isConnected) {
      return { label: 'Local Mode Active', color: 'text-orange-500', icon: Router };
    }
    if (firebaseConnected) {
      return { label: 'Online (Firebase)', color: 'text-green-500', icon: Wifi };
    }
    if (hasFirebaseConfig) {
      return { label: 'Firebase Offline', color: 'text-destructive', icon: WifiOff };
    }
    return { label: 'No Connection', color: 'text-muted-foreground', icon: WifiOff };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Router className="w-5 h-5" />
              Connection Configuration
            </CardTitle>
            <CardDescription className="mt-1">
              Configure offline direct-connect mode when internet is unavailable
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={cn("gap-1.5", status.color)}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Internet Status Warning */}
        {!firebaseConnected && hasFirebaseConfig && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Firebase Disconnected</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enable offline mode to control devices directly via local Wi-Fi
              </p>
            </div>
          </div>
        )}

        {/* Offline Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="offline-mode" className="font-medium flex items-center gap-2">
              <Signal className="w-4 h-4" />
              Offline Mode (Direct Connect)
            </Label>
            <p className="text-sm text-muted-foreground">
              Connect directly to ESP32 at default IP {DEFAULT_DEVICE_IP}
            </p>
          </div>
          <Switch
            id="offline-mode"
            checked={config.enabled}
            onCheckedChange={handleToggleOfflineMode}
          />
        </div>

        <Separator />

        {/* Device IP Configuration */}
        <div className="space-y-4">
          <Label className="font-medium">Device IP Address</Label>
          <div className="flex gap-2">
            <Input
              value={customIp}
              onChange={(e) => handleIpChange(e.target.value)}
              placeholder={DEFAULT_DEVICE_IP}
              className="font-mono"
              disabled={!config.enabled}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handlePing}
              disabled={!config.enabled || isPinging}
            >
              <RefreshCw className={cn("w-4 h-4", isPinging && "animate-spin")} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Default: {DEFAULT_DEVICE_IP} — Change if your ESP32 has a different IP
          </p>
        </div>

        {/* Connection Status Details */}
        {config.enabled && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="font-medium">Connection Status</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    {config.isConnected ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-xs font-medium">Device Status</span>
                  </div>
                  <p className="text-sm font-bold">
                    {config.isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Last Ping</span>
                  </div>
                  <p className="text-sm font-bold">
                    {config.lastPing 
                      ? format(config.lastPing, 'HH:mm:ss')
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            How to use Offline Mode
          </h4>
          <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Connect your phone/computer to ESP32's Wi-Fi network</li>
            <li>The default IP is usually <code className="text-foreground bg-muted px-1 rounded">{DEFAULT_DEVICE_IP}</code></li>
            <li>Enable offline mode above</li>
            <li>All device controls will work over local network</li>
            <li>Actions are logged locally and synced when online</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
