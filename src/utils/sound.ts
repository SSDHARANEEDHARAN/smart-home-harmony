export type SoundType = 
  | 'none' 
  | 'click' 
  | 'pop' 
  | 'ding' 
  | 'chime' 
  | 'beep' 
  | 'swoosh' 
  | 'bubble' 
  | 'ping' 
  | 'tap' 
  | 'snap' 
  | 'whoosh' 
  | 'blip' 
  | 'notify' 
  | 'success' 
  | 'alert' 
  | 'unlock' 
  | 'lock' 
  | 'power' 
  | 'switch';

export const SOUND_TYPES: { value: SoundType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'click', label: 'Click' },
  { value: 'pop', label: 'Pop' },
  { value: 'ding', label: 'Ding' },
  { value: 'chime', label: 'Chime' },
  { value: 'beep', label: 'Beep' },
  { value: 'swoosh', label: 'Swoosh' },
  { value: 'bubble', label: 'Bubble' },
  { value: 'ping', label: 'Ping' },
  { value: 'tap', label: 'Tap' },
  { value: 'snap', label: 'Snap' },
  { value: 'whoosh', label: 'Whoosh' },
  { value: 'blip', label: 'Blip' },
  { value: 'notify', label: 'Notify' },
  { value: 'success', label: 'Success' },
  { value: 'alert', label: 'Alert' },
  { value: 'unlock', label: 'Unlock' },
  { value: 'lock', label: 'Lock' },
  { value: 'power', label: 'Power' },
  { value: 'switch', label: 'Switch' },
];

const FREQUENCIES: Record<string, number> = {
  click: 800,
  pop: 600,
  ding: 1000,
  chime: 880,
  beep: 440,
  swoosh: 300,
  bubble: 500,
  ping: 1200,
  tap: 700,
  snap: 900,
  whoosh: 200,
  blip: 660,
  notify: 520,
  success: 750,
  alert: 400,
  unlock: 850,
  lock: 350,
  power: 1100,
  switch: 450,
};

export function playNotificationSound(soundType: SoundType) {
  if (soundType === 'none') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = FREQUENCIES[soundType] || 440;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    console.error('Failed to play sound:', e);
  }
}
