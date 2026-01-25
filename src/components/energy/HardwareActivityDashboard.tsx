import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRelayHistory } from '@/hooks/useRelayHistory';
import { useDevices } from '@/hooks/useDevices';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { useHome } from '@/contexts/HomeContext';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Power, 
  Zap, 
  Clock, 
  Monitor, 
  Cpu, 
  ChevronDown,
  ChevronUp,
  Server,
  Database,
  Radio,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  deviceName: string;
  relayPin: number | null;
  previousState: boolean | null;
  newState: boolean;
  source: 'web' | 'hardware';
}

export function HardwareActivityDashboard() {
  const { history, isLoading } = useRelayHistory();
  const { devices } = useDevices();
  const { isConnected, hasFirebaseConfig } = useFirebaseSync();
  const { currentHome } = useHome();
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [connectionStats, setConnectionStats] = useState({
    totalEvents: 0,
    webEvents: 0,
    hardwareEvents: 0,
    lastSync: null as Date | null,
    uptime: 0,
  });

  // Convert history to timeline events
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    return history.map(entry => ({
      id: entry.id,
      timestamp: new Date(entry.triggered_at),
      deviceName: entry.device_name || `Relay ${entry.relay_pin}`,
      relayPin: entry.relay_pin,
      previousState: entry.previous_state,
      newState: entry.new_state,
      source: entry.source as 'web' | 'hardware',
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [history]);

  // Calculate connection stats
  useEffect(() => {
    if (history.length === 0) return;
    
    const webEvents = history.filter(e => e.source === 'web').length;
    const hardwareEvents = history.filter(e => e.source === 'hardware').length;
    const lastEntry = history[0];
    
    setConnectionStats({
      totalEvents: history.length,
      webEvents,
      hardwareEvents,
      lastSync: lastEntry ? new Date(lastEntry.triggered_at) : null,
      uptime: hasFirebaseConfig && isConnected ? 100 : 0,
    });
  }, [history, hasFirebaseConfig, isConnected]);

  // Group events by day
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    
    timelineEvents.forEach(event => {
      let key: string;
      if (isToday(event.timestamp)) {
        key = 'Today';
      } else if (isYesterday(event.timestamp)) {
        key = 'Yesterday';
      } else {
        key = format(event.timestamp, 'EEEE, MMMM d');
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
    });
    
    return groups;
  }, [timelineEvents]);

  const displayedGroups = showAllLogs 
    ? groupedEvents 
    : Object.fromEntries(Object.entries(groupedEvents).slice(0, 2));

  const formatEventTime = (date: Date) => {
    return format(date, 'HH:mm:ss');
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Activity className="w-6 h-6 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Statistics */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Server className="w-4 h-4" />
            Connection Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Firebase Status */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                {hasFirebaseConfig ? (
                  isConnected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-destructive" />
                  )
                ) : (
                  <Radio className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-xs font-medium">Firebase</span>
              </div>
              <div className="text-lg font-bold">
                {hasFirebaseConfig ? (isConnected ? 'Connected' : 'Offline') : 'Not Set'}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {currentHome?.firebaseConfig?.databaseURL 
                  ? 'RTDB Active' 
                  : 'No database URL'}
              </p>
            </div>

            {/* Total Events */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Total Events</span>
              </div>
              <div className="text-lg font-bold">{connectionStats.totalEvents}</div>
              <p className="text-[10px] text-muted-foreground mt-1">All time triggers</p>
            </div>

            {/* Web vs Hardware */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium">Source Split</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Monitor className="w-3 h-3 text-primary" />
                  <span className="text-sm font-bold">{connectionStats.webEvents}</span>
                </div>
                <span className="text-muted-foreground">/</span>
                <div className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-orange-500" />
                  <span className="text-sm font-bold">{connectionStats.hardwareEvents}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Web / Hardware</p>
            </div>

            {/* Last Sync */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium">Last Activity</span>
              </div>
              <div className="text-sm font-bold truncate">
                {connectionStats.lastSync 
                  ? formatDistanceToNow(connectionStats.lastSync, { addSuffix: true })
                  : 'No activity'}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {connectionStats.lastSync 
                  ? format(connectionStats.lastSync, 'HH:mm:ss')
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Visualization + Live Logs */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              ESP32 Activity Timeline
            </CardTitle>
            <Badge variant="outline" className="text-[10px] gap-1">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
              )} />
              {isConnected ? 'Live' : 'Static'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {timelineEvents.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No activity recorded yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Toggle devices to see activity here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(displayedGroups).map(([day, events]) => (
                <div key={day}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-muted-foreground">{day}</span>
                    <Separator className="flex-1" />
                    <span className="text-[10px] text-muted-foreground">
                      {events.length} event{events.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
                    
                    <div className="space-y-2">
                      {events.slice(0, showAllLogs ? undefined : 10).map((event, idx) => (
                        <div 
                          key={event.id} 
                          className="relative flex items-start gap-3 pl-8"
                        >
                          {/* Timeline dot */}
                          <div className={cn(
                            "absolute left-[11px] top-1.5 w-2 h-2 rounded-full border-2 bg-background",
                            event.source === 'hardware' 
                              ? "border-orange-500" 
                              : "border-primary"
                          )} />
                          
                          {/* Event card */}
                          <div className={cn(
                            "flex-1 p-2.5 rounded-lg border transition-colors",
                            event.newState 
                              ? "bg-green-500/5 border-green-500/30" 
                              : "bg-muted/30 border-border/50"
                          )}>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                {event.source === 'hardware' ? (
                                  <Cpu className="w-3.5 h-3.5 text-orange-500" />
                                ) : (
                                  <Monitor className="w-3.5 h-3.5 text-primary" />
                                )}
                                <span className="text-xs font-medium">{event.deviceName}</span>
                                {event.relayPin && (
                                  <Badge variant="outline" className="text-[9px] py-0 px-1">
                                    R{event.relayPin}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-[9px] gap-1",
                                    event.newState 
                                      ? "bg-green-500/10 text-green-500 border-green-500/30" 
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {event.newState ? (
                                    <><Zap className="w-2.5 h-2.5" /> ON</>
                                  ) : (
                                    <><Power className="w-2.5 h-2.5" /> OFF</>
                                  )}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {formatEventTime(event.timestamp)}
                                </span>
                              </div>
                            </div>
                            {event.previousState !== null && (
                              <div className="mt-1.5 text-[10px] text-muted-foreground">
                                State changed: {event.previousState ? 'ON' : 'OFF'} → {event.newState ? 'ON' : 'OFF'}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show more button */}
              {Object.keys(groupedEvents).length > 2 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => setShowAllLogs(!showAllLogs)}
                >
                  {showAllLogs ? (
                    <><ChevronUp className="w-3 h-3 mr-1" /> Show Less</>
                  ) : (
                    <><ChevronDown className="w-3 h-3 mr-1" /> Show All History</>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
