import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Power } from 'lucide-react';
import { ToggleStyle } from '@/types/smarthome';
import { cn } from '@/lib/utils';

interface DeviceToggleProps {
  isOn: boolean;
  style: ToggleStyle;
  glowColor: string;
  onToggle: (isOn: boolean) => void;
  value?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
}

export function DeviceToggle({
  isOn,
  style,
  glowColor,
  onToggle,
  value = 100,
  onValueChange,
  disabled = false,
}: DeviceToggleProps) {
  if (style === 'slider') {
    return (
      <div className="flex items-center gap-3 w-full">
        <Slider
          value={[isOn ? value : 0]}
          max={100}
          step={1}
          onValueChange={(v) => {
            if (v[0] > 0 && !isOn) onToggle(true);
            if (v[0] === 0 && isOn) onToggle(false);
            onValueChange?.(v[0]);
          }}
          disabled={disabled}
          className="flex-1"
          style={{
            '--slider-color': glowColor,
          } as React.CSSProperties}
        />
        <span className="text-sm text-muted-foreground w-10 text-right">
          {isOn ? value : 0}%
        </span>
      </div>
    );
  }

  if (style === 'button') {
    return (
      <Button
        variant={isOn ? 'default' : 'outline'}
        size="icon"
        onClick={() => onToggle(!isOn)}
        disabled={disabled}
        className={cn(
          "w-12 h-12 rounded-full transition-all duration-300",
          isOn && "shadow-lg"
        )}
        style={{
          backgroundColor: isOn ? glowColor : undefined,
          boxShadow: isOn ? `0 0 20px ${glowColor}` : undefined,
        }}
      >
        <Power className={cn("w-5 h-5", isOn ? "text-background" : "text-foreground")} />
      </Button>
    );
  }

  // Default switch style
  return (
    <Switch
      checked={isOn}
      onCheckedChange={onToggle}
      disabled={disabled}
      className="data-[state=checked]:bg-primary"
      style={{
        '--switch-color': glowColor,
      } as React.CSSProperties}
    />
  );
}
