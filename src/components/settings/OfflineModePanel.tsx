import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Search,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

// WiFi Signal Strength Indicator Component
function WifiSignalStrength({ strength, className }: { strength: number; className?: string }) {
  const getSignalIcon = () => {
    if (strength >= 80) return SignalHigh;
    if (strength >= 50) return SignalMedium;
    if (strength >= 20) return SignalLow;
    return Signal;
  };
  
  const getSignalColor = () => {
    if (strength >= 80) return 'text-green-500';
    if (strength >= 50) return 'text-yellow-500';
    if (strength >= 20) return 'text-orange-500';
    return 'text-destructive';
  };
  
  const getSignalLabel = () => {
    if (strength >= 80) return 'Excellent';
    if (strength >= 50) return 'Good';
    if (strength >= 20) return 'Fair';
    if (strength > 0) return 'Weak';
    return 'No Signal';
  };
  
  const Icon = getSignalIcon();
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        {/* Signal bars visualization */}
        <div className="flex items-end gap-0.5 h-4">
          {[1, 2, 3, 4].map((bar) => {
            const barThreshold = bar * 25;
            const isActive = strength >= barThreshold - 20;
            return (
              <div
                key={bar}
                className={cn(
                  "w-1 rounded-sm transition-all",
                  isActive ? getSignalColor().replace('text-', 'bg-') : 'bg-muted'
                )}
                style={{ height: `${bar * 4}px` }}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col">
        <span className={cn("text-xs font-medium", getSignalColor())}>
          {getSignalLabel()}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {strength}%
        </span>
      </div>
    </div>
  );
}

export function OfflineModePanel() {
  const { 
    config, 
    enableOfflineMode, 
    disableOfflineMode, 
    setDeviceIp, 
    pingDevice,
    scanNetwork,
    discoveredDevices,
    isScanning,
    scanProgress,
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

  const handleScan = async () => {
    await scanNetwork();
  };

  const handleSelectDevice = (ip: string) => {
    setCustomIp(ip);
    setDeviceIp(ip);
    if (!config.enabled) {
      enableOfflineMode(ip);
    }
    toast.success(`Selected device at ${ip}`);
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

        {/* Device Discovery Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium flex items-center gap-2">
              <Search className="w-4 h-4" />
              Device Discovery
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScan}
              disabled={isScanning}
              className="gap-1.5"
            >
              {isScanning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Radio className="w-3.5 h-3.5" />
              )}
              {isScanning ? 'Scanning...' : 'Scan Network'}
            </Button>
          </div>
          
          {/* Scan Progress */}
          {isScanning && (
            <div className="space-y-2">
              <Progress value={scanProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Scanning local network... {scanProgress}%
              </p>
            </div>
          )}
          
          {/* Discovered Devices List */}
          {discoveredDevices.length > 0 && (
            <ScrollArea className="h-[120px] rounded-lg border border-border/50">
              <div className="p-2 space-y-2">
                {discoveredDevices.map((device) => (
                  <div
                    key={device.ip}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                      device.ip === config.deviceIp
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-muted/30 hover:bg-muted/50 border border-transparent"
                    )}
                    onClick={() => handleSelectDevice(device.ip)}
                  >
                    <div className="flex items-center gap-2">
                      <Router className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">{device.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {device.ip}
                        </p>
                      </div>
                    </div>
                    {device.ip === config.deviceIp && (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          {!isScanning && discoveredDevices.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              Click "Scan Network" to discover ESP32 devices
            </p>
          )}
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

        {/* Connection Status Details with Signal Strength */}
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
              
              {/* WiFi Signal Strength Indicator */}
              {config.isConnected && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium">Signal Strength</span>
                    </div>
                    <WifiSignalStrength strength={config.signalStrength} />
                  </div>
                  
                  {/* Visual Signal Bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-300 rounded-full",
                          config.signalStrength >= 80 ? "bg-green-500" :
                          config.signalStrength >= 50 ? "bg-yellow-500" :
                          config.signalStrength >= 20 ? "bg-orange-500" :
                          "bg-destructive"
                        )}
                        style={{ width: `${config.signalStrength}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
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
            <li>Click "Scan Network" to discover available devices</li>
            <li>Select your ESP32 device or enter IP manually</li>
            <li>Enable offline mode above</li>
            <li>All device controls will work over local network</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
