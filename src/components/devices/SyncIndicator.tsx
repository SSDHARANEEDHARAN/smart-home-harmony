import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncIndicatorProps {
  isSyncing: boolean;
  className?: string;
}

export function SyncIndicator({ isSyncing, className }: SyncIndicatorProps) {
  if (!isSyncing) return null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse",
      className
    )}>
      <Loader2 className="w-3 h-3 animate-spin" />
      <span>Syncing...</span>
    </div>
  );
}
