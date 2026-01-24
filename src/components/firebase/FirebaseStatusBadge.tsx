import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { Wifi, WifiOff, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FirebaseStatusBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function FirebaseStatusBadge({ variant = 'full', className }: FirebaseStatusBadgeProps) {
  const { isConnected, hasFirebaseConfig } = useFirebaseSync();

  if (!hasFirebaseConfig) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          "flex items-center justify-center w-5 h-5 rounded-full",
          isConnected 
            ? "bg-green-500/20 text-green-500" 
            : "bg-destructive/20 text-destructive",
          className
        )}
        title={isConnected ? "Firebase Connected" : "Firebase Disconnected"}
      >
        <Flame className="w-3 h-3" />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        isConnected 
          ? "bg-green-500/20 text-green-500" 
          : "bg-destructive/20 text-destructive",
        className
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Disconnected</span>
        </>
      )}
    </div>
  );
}

export function FirebaseActiveBadge({ className }: { className?: string }) {
  const { isConnected, hasFirebaseConfig } = useFirebaseSync();

  if (!hasFirebaseConfig || !isConnected) {
    return null;
  }

  return (
    <span title="Firebase Active">
      <Flame className={cn("w-3.5 h-3.5 text-orange-500", className)} />
    </span>
  );
}
