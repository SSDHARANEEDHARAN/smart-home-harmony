import { useState } from 'react';
import { useNodeServerSync } from '@/hooks/useNodeServerSync';
import { Wifi, WifiOff, Server, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface NodeServerStatusBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function NodeServerStatusBadge({ variant = 'full', className }: NodeServerStatusBadgeProps) {
  const { isConnected, hasNodeServerConfig, reconnect } = useNodeServerSync();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!hasNodeServerConfig) {
    return null;
  }

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRetrying || isConnected) return;
    setIsRetrying(true);
    reconnect();
    toast.info('Reconnecting to Node Server...');
    setTimeout(() => setIsRetrying(false), 3000);
  };

  if (variant === 'compact') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleRetry}
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full transition-all",
              isConnected 
                ? "bg-green-500/20 text-green-500" 
                : "bg-destructive/20 text-destructive hover:bg-destructive/30 cursor-pointer",
              isRetrying && "animate-spin",
              className
            )}
          >
            {isRetrying ? (
              <RefreshCw className="w-3 h-3" />
            ) : (
              <Server className="w-3 h-3" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {isConnected ? 'Node Server Connected' : isRetrying ? 'Reconnecting...' : 'Node Server Offline — click to retry'}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      onClick={handleRetry}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all",
        isConnected 
          ? "bg-green-500/20 text-green-500" 
          : "bg-destructive/20 text-destructive hover:bg-destructive/30 cursor-pointer",
        className
      )}
    >
      {isRetrying ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Retrying...</span>
        </>
      ) : isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Node Server</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Retry</span>
        </>
      )}
    </button>
  );
}
