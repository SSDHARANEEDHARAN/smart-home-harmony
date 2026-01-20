import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Power, ChevronLeft, ChevronRight } from 'lucide-react';
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
  step?: number;
}

export function DeviceToggle({
  isOn,
  style,
  glowColor,
  onToggle,
  value = 100,
  onValueChange,
  disabled = false,
  step = 10,
}: DeviceToggleProps) {
  const handleDecrement = () => {
    const newValue = Math.max(0, (isOn ? value : 0) - step);
    if (newValue === 0 && isOn) onToggle(false);
    onValueChange?.(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(100, (isOn ? value : 0) + step);
    if (newValue > 0 && !isOn) onToggle(true);
    onValueChange?.(newValue);
  };

  if (style === 'slider') {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDecrement}
          disabled={disabled}
          className="h-8 w-8 shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span 
          className="text-sm font-medium w-10 text-center"
          style={{ color: isOn ? glowColor : undefined }}
        >
          {isOn ? value : 0}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleIncrement}
          disabled={disabled}
          className="h-8 w-8 shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
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
          "w-10 h-10 rounded-full transition-all duration-300",
          isOn && "shadow-lg"
        )}
        style={{
          backgroundColor: isOn ? glowColor : undefined,
          boxShadow: isOn ? `0 0 20px ${glowColor}` : undefined,
        }}
      >
        <Power className={cn("w-4 h-4", isOn ? "text-background" : "text-foreground")} />
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
