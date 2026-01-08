import {
  Lightbulb,
  Power,
  Fan,
  Snowflake,
  Flame,
  Camera,
  Lock,
  Radio,
  Tv,
  Plug,
  LucideIcon,
} from 'lucide-react';
import { DeviceType } from '@/types/smarthome';

const iconMap: Record<DeviceType, LucideIcon> = {
  light: Lightbulb,
  switch: Power,
  fan: Fan,
  ac: Snowflake,
  heater: Flame,
  camera: Camera,
  lock: Lock,
  sensor: Radio,
  tv: Tv,
  appliance: Plug,
};

interface DeviceIconProps {
  type: DeviceType;
  className?: string;
}

export function DeviceIcon({ type, className = "w-6 h-6" }: DeviceIconProps) {
  const Icon = iconMap[type] || Power;
  return <Icon className={className} />;
}
