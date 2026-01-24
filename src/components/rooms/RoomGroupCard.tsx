import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Power, ChevronDown, ChevronUp } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Device, Room } from '@/types/smarthome';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RoomGroupCardProps {
  room: Room;
  devices: Device[];
  onToggleDevice: (deviceId: string, isOn: boolean) => void;
  onValueChange?: (deviceId: string, value: number) => void;
}

export function RoomGroupCard({ room, devices, onToggleDevice, onValueChange }: RoomGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const activeCount = devices.filter(d => d.is_on).length;
  const allOn = devices.length > 0 && devices.every(d => d.is_on);
  const someOn = devices.some(d => d.is_on);
  
  // Get icon component
  const IconComponent = (LucideIcons as any)[room.icon] || LucideIcons.Home;
  
  // Get dominant glow color from active devices
  const activeDevices = devices.filter(d => d.is_on && d.glow_color);
  const dominantColor = activeDevices.length > 0 ? activeDevices[0].glow_color : undefined;
  
  const handleToggleAll = () => {
    // If any device is on, turn all off. Otherwise turn all on.
    const newState = !someOn;
    devices.forEach(device => {
      if (device.is_on !== newState) {
        onToggleDevice(device.id, newState);
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Room Header Card with Power Button */}
      <Card 
        className={cn(
          "transition-all duration-300 border-border/50",
          someOn && "border-foreground/20"
        )}
        style={someOn && dominantColor ? { 
          backgroundColor: dominantColor + '10',
          borderColor: dominantColor + '40'
        } : undefined}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            {/* Left: Room Info */}
            <button 
              className="flex items-center gap-3 flex-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div 
                className="p-2 rounded-lg bg-muted"
                style={someOn && dominantColor ? { 
                  backgroundColor: dominantColor + '20',
                  color: dominantColor
                } : undefined}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">{room.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {activeCount}/{devices.length} on
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
              )}
            </button>
            
            {/* Right: Master Power Button */}
            <Button
              variant={someOn ? "default" : "outline"}
              size="icon"
              onClick={handleToggleAll}
              className={cn(
                "h-10 w-10 rounded-full transition-all duration-300",
                allOn && "ring-2 ring-offset-2 ring-offset-background",
                someOn && !allOn && "bg-muted"
              )}
              style={someOn && dominantColor ? {
                backgroundColor: dominantColor,
                borderColor: dominantColor,
                boxShadow: allOn ? `0 0 20px ${dominantColor}` : undefined
              } : undefined}
            >
              <Power className={cn(
                "w-5 h-5",
                someOn ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Devices Grid - Collapsible */}
      {isExpanded && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pl-2">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={(isOn) => onToggleDevice(device.id, isOn)}
              onValueChange={onValueChange ? (value) => onValueChange(device.id, value) : undefined}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
