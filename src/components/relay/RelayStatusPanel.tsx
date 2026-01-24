import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDevices } from '@/hooks/useDevices';
import { useHome } from '@/contexts/HomeContext';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { getFirebaseInstance } from '@/services/firebaseService';
import { ref, onValue } from 'firebase/database';
import { Activity, Wifi, WifiOff, Power, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelayState {
  pin: number;
  state: boolean;
  deviceName?: string;
  deviceId?: string;
}

export function RelayStatusPanel() {
  const { devices } = useDevices();
  const { currentHomeId, currentHome } = useHome();
  const { isConnected, hasFirebaseConfig } = useFirebaseSync();
  const [relayStates, setRelayStates] = useState<Map<number, boolean>>(new Map());

  // Get devices with relay pins
  const devicesWithRelays = devices.filter(d => d.relay_pin);

  // Subscribe to Firebase relay states
  useEffect(() => {
    if (!hasFirebaseConfig || !isConnected) {
      return;
    }

    const instance = getFirebaseInstance(currentHomeId);
    if (!instance) return;

    const unsubscribes: (() => void)[] = [];

    // Subscribe to each relay pin
    devicesWithRelays.forEach(device => {
      if (device.relay_pin) {
        const relayRef = ref(instance.db, `/relay${device.relay_pin}`);
        const unsubscribe = onValue(relayRef, (snapshot) => {
          const state = snapshot.val();
          if (typeof state === 'boolean') {
            setRelayStates(prev => new Map(prev).set(device.relay_pin!, state));
          }
        });
        unsubscribes.push(unsubscribe);
      }
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [currentHomeId, hasFirebaseConfig, isConnected, devicesWithRelays.length]);

  // Build relay status list
  const relayStatuses: RelayState[] = devicesWithRelays.map(device => ({
    pin: device.relay_pin!,
    state: relayStates.has(device.relay_pin!) 
      ? relayStates.get(device.relay_pin!)! 
      : device.is_on,
    deviceName: device.name,
    deviceId: device.id,
  }));

  if (devicesWithRelays.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" />
            Relay Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            No devices with relay pins configured
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" />
            Relay Status
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {hasFirebaseConfig ? (
              isConnected ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-[10px] gap-1">
                  <Wifi className="w-2.5 h-2.5" />
                  Live
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] gap-1">
                  <WifiOff className="w-2.5 h-2.5" />
                  Offline
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="text-[10px]">No Firebase</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {relayStatuses.map((relay) => (
            <div
              key={relay.pin}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg border transition-all",
                relay.state 
                  ? "border-green-500/50 bg-green-500/10" 
                  : "border-border/50 bg-muted/30"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-1.5",
                relay.state 
                  ? "bg-green-500/20 text-green-500" 
                  : "bg-muted text-muted-foreground"
              )}>
                {relay.state ? (
                  <Zap className="w-4 h-4" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
              </div>
              <span className="text-[10px] font-mono font-medium">
                Relay {relay.pin}
              </span>
              <span className={cn(
                "text-[9px] mt-0.5",
                relay.state ? "text-green-500" : "text-muted-foreground"
              )}>
                {relay.state ? 'ON' : 'OFF'}
              </span>
              {relay.deviceName && (
                <span className="text-[8px] text-muted-foreground truncate max-w-full mt-0.5">
                  {relay.deviceName}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
