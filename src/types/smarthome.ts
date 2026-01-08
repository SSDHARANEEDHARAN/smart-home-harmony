export type DeviceType = 'light' | 'switch' | 'fan' | 'ac' | 'heater' | 'camera' | 'lock' | 'sensor' | 'tv' | 'appliance';
export type ToggleStyle = 'switch' | 'slider' | 'button';

export interface Room {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  room_id: string;
  name: string;
  device_type: DeviceType;
  is_on: boolean;
  brightness: number;
  speed: number;
  temperature: number;
  glow_color: string;
  icon: string;
  toggle_style: ToggleStyle;
  power_consumption: number;
  api_endpoint: string | null;
  created_at: string;
  updated_at: string;
  room?: Room;
}

export interface AutomationRule {
  id: string;
  user_id: string;
  device_id: string;
  name: string;
  trigger_time: string;
  action: string;
  target_state: boolean;
  is_enabled: boolean;
  days_of_week: number[];
  created_at: string;
  updated_at: string;
  device?: Device;
}

export interface EnergyLog {
  id: string;
  device_id: string;
  user_id: string;
  consumption: number;
  unit: string;
  logged_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export const DEVICE_ICONS: Record<DeviceType, string> = {
  light: 'Lightbulb',
  switch: 'Power',
  fan: 'Fan',
  ac: 'Snowflake',
  heater: 'Flame',
  camera: 'Camera',
  lock: 'Lock',
  sensor: 'Radio',
  tv: 'Tv',
  appliance: 'Plug',
};

export const ROOM_ICONS = [
  'Home', 'Sofa', 'Bed', 'UtensilsCrossed', 'Bath', 
  'Briefcase', 'Car', 'TreePine', 'Baby', 'Gamepad2'
];

export const GLOW_COLORS = [
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Green', value: '#00ff88' },
  { name: 'Orange', value: '#ff8800' },
  { name: 'Pink', value: '#ff0088' },
  { name: 'Blue', value: '#0088ff' },
  { name: 'Yellow', value: '#ffff00' },
  { name: 'Red', value: '#ff4444' },
];
