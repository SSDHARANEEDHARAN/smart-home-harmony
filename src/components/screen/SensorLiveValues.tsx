import { useEffect, useState } from 'react';
import { Device } from '@/types/smarthome';
import { Card, CardContent } from '@/components/ui/card';
import { FirebaseConfig } from '@/contexts/HomeContext';
import { getFirebaseInstance } from '@/services/firebaseService';
import { ref, onValue } from 'firebase/database';
import { Radio, Thermometer, Droplets, Wind, Gauge } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SensorLiveValuesProps {
  sensorDevices: Device[];
  homeId: string;
  firebaseConfig?: FirebaseConfig;
}

interface SensorReading {
  deviceId: string;
  value: number | string | null;
  label: string;
  unit: string;
  source: 'firebase' | 'api' | 'supabase';
  lastUpdated: Date;
}

export function SensorLiveValues({ sensorDevices, homeId, firebaseConfig }: SensorLiveValuesProps) {
  const [readings, setReadings] = useState<Map<string, SensorReading>>(new Map());

  // Firebase RTDB listener for sensor data
  useEffect(() => {
    if (!firebaseConfig?.apiKey) return;
    const instance = getFirebaseInstance(homeId);
    if (!instance) return;

    const unsubscribes: (() => void)[] = [];

    sensorDevices.forEach(device => {
      if (!device.relay_pin) return;
      const sensorRef = ref(instance.db, `/sensor${device.relay_pin}`);
      const unsub = onValue(sensorRef, (snapshot) => {
        const val = snapshot.val();
        if (val !== null && val !== undefined) {
          setReadings(prev => {
            const next = new Map(prev);
            next.set(`firebase-${device.id}`, {
              deviceId: device.id,
              value: typeof val === 'object' ? JSON.stringify(val) : val,
              label: device.name,
              unit: device.description || '',
              source: 'firebase',
              lastUpdated: new Date(),
            });
            return next;
          });
        }
      });
      unsubscribes.push(unsub);
    });

    return () => unsubscribes.forEach(u => u());
  }, [sensorDevices, homeId, firebaseConfig]);

  // API endpoint polling
  useEffect(() => {
    const apiDevices = sensorDevices.filter(d => d.api_endpoint);
    if (apiDevices.length === 0) return;

    const fetchApiData = async () => {
      for (const device of apiDevices) {
        if (!device.api_endpoint) continue;
        try {
          const res = await fetch(device.api_endpoint);
          const data = await res.json();
          setReadings(prev => {
            const next = new Map(prev);
            next.set(`api-${device.id}`, {
              deviceId: device.id,
              value: typeof data === 'object' ? (data.value ?? JSON.stringify(data)) : data,
              label: device.name,
              unit: device.description || '',
              source: 'api',
              lastUpdated: new Date(),
            });
            return next;
          });
        } catch {
          // silently fail for individual sensors
        }
      }
    };

    fetchApiData();
    const interval = setInterval(fetchApiData, 5000);
    return () => clearInterval(interval);
  }, [sensorDevices]);

  // Supabase realtime for energy_logs (latest per device)
  useEffect(() => {
    if (sensorDevices.length === 0) return;

    const channel = supabase
      .channel('screen-energy-logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'energy_logs',
      }, (payload) => {
        const log = payload.new as any;
        const device = sensorDevices.find(d => d.id === log.device_id);
        if (device) {
          setReadings(prev => {
            const next = new Map(prev);
            next.set(`supabase-${device.id}`, {
              deviceId: device.id,
              value: log.consumption,
              label: device.name,
              unit: log.unit || 'kWh',
              source: 'supabase',
              lastUpdated: new Date(log.logged_at),
            });
            return next;
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sensorDevices]);

  const allReadings = Array.from(readings.values());

  if (sensorDevices.length === 0 && allReadings.length === 0) {
    return null;
  }

  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('temp')) return Thermometer;
    if (l.includes('humid')) return Droplets;
    if (l.includes('wind') || l.includes('fan')) return Wind;
    if (l.includes('pressure') || l.includes('gas')) return Gauge;
    return Radio;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">Live Sensor Readings</h2>
        {allReadings.length > 0 && (
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>

      {allReadings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Radio className="w-8 h-8 mb-2" />
            <p className="text-sm">No live sensor data yet.</p>
            <p className="text-xs mt-1">Configure sensor devices with relay pins, API endpoints, or Firebase to see live data.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allReadings.map((reading, i) => {
            const Icon = getIcon(reading.label);
            return (
              <Card key={`${reading.source}-${reading.deviceId}`} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{reading.label}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {reading.source}
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      {typeof reading.value === 'number' ? reading.value.toFixed(1) : reading.value}
                    </span>
                    {reading.unit && (
                      <span className="text-sm text-muted-foreground ml-1">{reading.unit}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Updated {reading.lastUpdated.toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
