import { useNodeServerSync } from '@/hooks/useNodeServerSync';
import { Wifi, WifiOff, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeServerStatusBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function NodeServerStatusBadge({ variant = 'full', className }: NodeServerStatusBadgeProps) {
  const { isConnected, hasNodeServerConfig } = useNodeServerSync();

  if (!hasNodeServerConfig) {
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
        title={isConnected ? "Node Server Connected" : "Node Server Disconnected"}
      >
        <Server className="w-3 h-3" />
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
          <span>Node Server</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Node Server</span>
        </>
      )}
    </div>
  );
}
