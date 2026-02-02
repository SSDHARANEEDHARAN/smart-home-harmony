export function ESP32Icon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <rect x="8" y="16" width="48" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <rect x="16" y="22" width="8" height="8" rx="1" opacity="0.7"/>
      <rect x="28" y="22" width="8" height="8" rx="1" opacity="0.7"/>
      <rect x="40" y="22" width="8" height="8" rx="1" opacity="0.7"/>
      <rect x="16" y="34" width="8" height="8" rx="1" opacity="0.7"/>
      <rect x="28" y="34" width="8" height="8" rx="1" opacity="0.7"/>
      <rect x="40" y="34" width="8" height="8" rx="1" opacity="0.7"/>
      {/* Pins */}
      <rect x="12" y="8" width="2" height="8" opacity="0.5"/>
      <rect x="20" y="8" width="2" height="8" opacity="0.5"/>
      <rect x="28" y="8" width="2" height="8" opacity="0.5"/>
      <rect x="36" y="8" width="2" height="8" opacity="0.5"/>
      <rect x="44" y="8" width="2" height="8" opacity="0.5"/>
      <rect x="12" y="48" width="2" height="8" opacity="0.5"/>
      <rect x="20" y="48" width="2" height="8" opacity="0.5"/>
      <rect x="28" y="48" width="2" height="8" opacity="0.5"/>
      <rect x="36" y="48" width="2" height="8" opacity="0.5"/>
      <rect x="44" y="48" width="2" height="8" opacity="0.5"/>
      {/* Antenna */}
      <path d="M50 20 L54 16 M50 16 L54 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function RaspberryPiIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      {/* Board */}
      <rect x="10" y="12" width="44" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* CPU */}
      <rect x="22" y="24" width="20" height="16" rx="2" opacity="0.8"/>
      {/* GPIO pins */}
      <g opacity="0.5">
        <rect x="14" y="14" width="1.5" height="4"/>
        <rect x="18" y="14" width="1.5" height="4"/>
        <rect x="22" y="14" width="1.5" height="4"/>
        <rect x="26" y="14" width="1.5" height="4"/>
        <rect x="30" y="14" width="1.5" height="4"/>
        <rect x="34" y="14" width="1.5" height="4"/>
        <rect x="38" y="14" width="1.5" height="4"/>
        <rect x="42" y="14" width="1.5" height="4"/>
        <rect x="46" y="14" width="1.5" height="4"/>
      </g>
      {/* USB ports */}
      <rect x="46" y="28" width="6" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="46" y="38" width="6" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      {/* Ethernet */}
      <rect x="12" y="30" width="8" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      {/* SD card slot */}
      <rect x="28" y="48" width="8" height="4" rx="0.5" opacity="0.6"/>
    </svg>
  );
}

export function FirebaseIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <path d="M16 48L20 12L32 28L16 48Z" opacity="0.6"/>
      <path d="M16 48L32 56L48 48L32 28L16 48Z" opacity="0.8"/>
      <path d="M32 28L44 16L48 48L32 28Z" opacity="0.9"/>
      <path d="M20 12L26 24L32 28L20 12Z" opacity="0.7"/>
    </svg>
  );
}

export function ArduinoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <ellipse cx="32" cy="32" rx="28" ry="18" fill="none" stroke="currentColor" strokeWidth="2"/>
      <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">∞</text>
      {/* Pins */}
      <rect x="10" y="28" width="6" height="2" opacity="0.5"/>
      <rect x="10" y="32" width="6" height="2" opacity="0.5"/>
      <rect x="48" y="28" width="6" height="2" opacity="0.5"/>
      <rect x="48" y="32" width="6" height="2" opacity="0.5"/>
    </svg>
  );
}

export function WiFiIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M32 48a4 4 0 100-8 4 4 0 000 8z" fill="currentColor"/>
      <path d="M22 38c5.5-5.5 14.5-5.5 20 0" strokeLinecap="round"/>
      <path d="M14 30c10-10 26-10 36 0" strokeLinecap="round"/>
      <path d="M6 22c14.5-14.5 37.5-14.5 52 0" strokeLinecap="round"/>
    </svg>
  );
}

export function CircuitIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="32" cy="32" r="6" fill="currentColor" opacity="0.8"/>
      <line x1="32" y1="8" x2="32" y2="26"/>
      <line x1="32" y1="38" x2="32" y2="56"/>
      <line x1="8" y1="32" x2="26" y2="32"/>
      <line x1="38" y1="32" x2="56" y2="32"/>
      <circle cx="32" cy="8" r="3" fill="currentColor" opacity="0.5"/>
      <circle cx="32" cy="56" r="3" fill="currentColor" opacity="0.5"/>
      <circle cx="8" cy="32" r="3" fill="currentColor" opacity="0.5"/>
      <circle cx="56" cy="32" r="3" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}
