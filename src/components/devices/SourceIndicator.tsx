import { Monitor, Cpu } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SourceIndicatorProps {
  source: 'web' | 'hardware';
  triggeredAt?: string;
  compact?: boolean;
  className?: string;
}

export function SourceIndicator({ source, triggeredAt, compact = false, className }: SourceIndicatorProps) {
  const isWeb = source === 'web';
  const Icon = isWeb ? Monitor : Cpu;
  const label = isWeb ? 'Web UI' : 'ESP32';
  const timeAgo = triggeredAt ? formatDistanceToNow(new Date(triggeredAt), { addSuffix: true }) : '';

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors",
                isWeb 
                  ? "bg-primary/10 text-primary" 
                  : "bg-orange-500/10 text-orange-500",
                className
              )}
            >
              <Icon className="w-2.5 h-2.5" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>Last changed via {label}</p>
            {timeAgo && <p className="text-muted-foreground">{timeAgo}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
              isWeb 
                ? "bg-primary/10 text-primary" 
                : "bg-orange-500/10 text-orange-500",
              className
            )}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden xs:inline">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Last state change via {label}</p>
          {timeAgo && <p className="text-muted-foreground">{timeAgo}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
