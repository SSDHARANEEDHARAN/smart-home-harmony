import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRelayHistory } from '@/hooks/useRelayHistory';
import { History, Trash2, Monitor, Cpu, Power, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function RelayHistoryLog() {
  const { history, isLoading, clearHistory } = useRelayHistory();

  const handleClearHistory = () => {
    clearHistory.mutate(undefined, {
      onSuccess: () => {
        toast.success('History cleared');
      },
    });
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="w-4 h-4" />
            Relay Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground text-sm">Loading history...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="w-4 h-4" />
            Relay Activity Log
          </CardTitle>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                  <Trash2 className="w-3 h-3" />
                  Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all relay activity logs. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">No activity logged yet</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Relay changes will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {/* Source Icon */}
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                    entry.source === 'web' 
                      ? "bg-primary/20 text-primary" 
                      : "bg-orange-500/20 text-orange-500"
                  )}>
                    {entry.source === 'web' ? (
                      <Monitor className="w-3.5 h-3.5" />
                    ) : (
                      <Cpu className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium truncate">
                        {entry.device_name || `Relay ${entry.relay_pin}`}
                      </span>
                      {entry.relay_pin && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1">
                          Pin {entry.relay_pin}
                        </Badge>
                      )}
                    </div>
                    
                    {/* State Change */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn(
                        "text-[10px] font-medium",
                        entry.previous_state === true ? "text-green-500" : 
                        entry.previous_state === false ? "text-muted-foreground" : "text-muted-foreground"
                      )}>
                        {entry.previous_state === null ? '—' : entry.previous_state ? 'ON' : 'OFF'}
                      </span>
                      <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className={cn(
                        "text-[10px] font-medium",
                        entry.new_state ? "text-green-500" : "text-destructive"
                      )}>
                        {entry.new_state ? 'ON' : 'OFF'}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.triggered_at), { addSuffix: true })}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {format(new Date(entry.triggered_at), 'HH:mm:ss')}
                      </span>
                    </div>
                  </div>

                  {/* Source Badge */}
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[9px] h-5 shrink-0",
                      entry.source === 'web' 
                        ? "border-primary/30 text-primary" 
                        : "border-orange-500/30 text-orange-500"
                    )}
                  >
                    {entry.source === 'web' ? 'Web UI' : 'Hardware'}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
