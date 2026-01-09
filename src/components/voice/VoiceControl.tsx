import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceControlProps {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceControl({
  isListening,
  isSupported,
  transcript,
  onStart,
  onStop,
}: VoiceControlProps) {
  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isListening ? 'default' : 'outline'}
        size="icon"
        onClick={isListening ? onStop : onStart}
        className={cn(
          "relative w-12 h-12 rounded-full transition-all duration-300",
          isListening && "bg-primary animate-pulse"
        )}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
        {isListening && (
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/50" />
        )}
      </Button>
      
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 animate-pulse">
          <div className="flex gap-1">
            <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-muted-foreground">
            {transcript || 'Listening...'}
          </span>
        </div>
      )}
    </div>
  );
}
