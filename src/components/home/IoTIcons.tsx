import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

// ESP32 Microcontroller Icon
export function ESP32Icon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="12" y="16" width="8" height="6" rx="1" fill="currentColor" opacity="0.6"/>
      <circle cx="32" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="32" cy="24" r="1.5" fill="currentColor"/>
      {/* Pins */}
      <line x1="10" y1="12" x2="10" y2="8" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="16" y1="12" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="22" y1="12" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="28" y1="12" x2="28" y2="8" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="34" y1="12" x2="34" y2="8" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="10" y1="36" x2="10" y2="40" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="16" y1="36" x2="16" y2="40" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="22" y1="36" x2="22" y2="40" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="28" y1="36" x2="28" y2="40" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="34" y1="36" x2="34" y2="40" stroke="currentColor" strokeWidth="1.5"/>
      <text x="12" y="32" fontSize="6" fill="currentColor" fontWeight="bold">ESP32</text>
    </svg>
  );
}

// Raspberry Pi Icon
export function RaspberryPiIcon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* GPIO Pins */}
      <g opacity="0.8">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <circle key={i} cx={10 + i * 3} cy="8" r="1" fill="currentColor"/>
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <circle key={`b${i}`} cx={10 + i * 3} cy="5" r="1" fill="currentColor"/>
        ))}
      </g>
      {/* CPU */}
      <rect x="12" y="16" width="12" height="12" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="14" y="18" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1"/>
      {/* Ports */}
      <rect x="30" y="14" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1"/>
      <rect x="30" y="24" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1"/>
      <rect x="30" y="30" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1"/>
      {/* LED */}
      <circle cx="12" cy="32" r="2" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

// Firebase Icon
export function FirebaseIcon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 38L16 8L24 22L28 14L36 38H12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M16 8L24 22" stroke="currentColor" strokeWidth="2"/>
      <path d="M28 14L36 38" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 38L24 44L36 38" stroke="currentColor" strokeWidth="2"/>
      <circle cx="24" cy="26" r="3" fill="currentColor" opacity="0.4"/>
    </svg>
  );
}

// ESP RainMaker Icon
export function RainMakerIcon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cloud */}
      <path d="M12 28C8 28 6 25 6 22C6 18 9 16 13 16C13 12 17 8 24 8C31 8 36 12 36 18C40 18 42 21 42 25C42 29 39 32 35 32H12Z" 
            stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Rain drops */}
      <line x1="16" y1="36" x2="14" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="36" x2="22" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="32" y1="36" x2="30" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Connection dots */}
      <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.6"/>
      <circle cx="28" cy="22" r="2" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

// ThingSpeak Icon (Chart/Analytics)
export function ThingSpeakIcon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="36" height="36" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Chart lines */}
      <polyline points="10,32 16,26 22,30 28,18 34,22 40,14" 
                stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Data points */}
      <circle cx="10" cy="32" r="2" fill="currentColor"/>
      <circle cx="16" cy="26" r="2" fill="currentColor"/>
      <circle cx="22" cy="30" r="2" fill="currentColor"/>
      <circle cx="28" cy="18" r="2" fill="currentColor"/>
      <circle cx="34" cy="22" r="2" fill="currentColor"/>
      <circle cx="40" cy="14" r="2" fill="currentColor"/>
      {/* Grid lines */}
      <line x1="10" y1="38" x2="40" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
      <line x1="10" y1="10" x2="10" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
    </svg>
  );
}

// MQTT Icon (Messaging/Protocol)
export function MQTTIcon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central broker */}
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.5"/>
      {/* Connected nodes */}
      <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="38" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="10" cy="38" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="38" cy="38" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      {/* Connection lines */}
      <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
      <line x1="34" y1="14" x2="30" y2="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
      <line x1="14" y1="34" x2="18" y2="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
      <line x1="34" y1="34" x2="30" y2="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
      {/* Messages */}
      <rect x="22" y="8" width="4" height="4" fill="currentColor" opacity="0.4"/>
      <rect x="22" y="36" width="4" height="4" fill="currentColor" opacity="0.4"/>
    </svg>
  );
}

// Circuit Icon
export function CircuitIcon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="36" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="36" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="36" cy="36" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <line x1="15" y1="12" x2="33" y2="12" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="15" x2="12" y2="33" stroke="currentColor" strokeWidth="2"/>
      <line x1="36" y1="15" x2="36" y2="33" stroke="currentColor" strokeWidth="2"/>
      <line x1="15" y1="36" x2="33" y2="36" stroke="currentColor" strokeWidth="2"/>
      <line x1="19" y1="24" x2="15" y2="24" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="29" y1="24" x2="33" y2="24" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="24" y1="19" x2="24" y2="15" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="24" y1="29" x2="24" y2="33" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

// WiFi Icon
export function WiFiIcon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 38C26.2091 38 28 36.2091 28 34C28 31.7909 26.2091 30 24 30C21.7909 30 20 31.7909 20 34C20 36.2091 21.7909 38 24 38Z" fill="currentColor"/>
      <path d="M14 28C14 28 18 24 24 24C30 24 34 28 34 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M8 22C8 22 14 16 24 16C34 16 40 22 40 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M2 16C2 16 10 8 24 8C38 8 46 16 46 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// Arduino Icon
export function ArduinoIcon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="14" cy="24" rx="10" ry="12" stroke="currentColor" strokeWidth="2" fill="none"/>
      <ellipse cx="34" cy="24" rx="10" ry="12" stroke="currentColor" strokeWidth="2" fill="none"/>
      <line x1="10" y1="24" x2="18" y2="24" stroke="currentColor" strokeWidth="2"/>
      <line x1="14" y1="20" x2="14" y2="28" stroke="currentColor" strokeWidth="2"/>
      <line x1="30" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// ESPHome Icon
export function ESPHomeIcon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* House shape */}
      <path d="M24 6L6 22H12V40H36V22H42L24 6Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* WiFi signal inside */}
      <path d="M18 30C18 30 20 28 24 28C28 28 30 30 30 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M15 26C15 26 18 22 24 22C30 22 33 26 33 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="34" r="2" fill="currentColor"/>
      {/* Chip indicator */}
      <rect x="20" y="14" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}

// Node Server Icon
export function NodeServerIcon({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Server rack */}
      <rect x="8" y="6" width="32" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="8" y="20" width="32" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="8" y="34" width="32" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* LEDs */}
      <circle cx="14" cy="12" r="2" fill="currentColor" opacity="0.6"/>
      <circle cx="14" cy="26" r="2" fill="currentColor" opacity="0.6"/>
      <circle cx="14" cy="38" r="2" fill="currentColor" opacity="0.6"/>
      {/* Drive bays */}
      <line x1="22" y1="10" x2="34" y2="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="22" y1="14" x2="34" y2="14" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="22" y1="24" x2="34" y2="24" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="22" y1="28" x2="34" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  );
}
