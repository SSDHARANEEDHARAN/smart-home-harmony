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
  | 'switch'
  | 'aurora'
  | 'bamboo'
  | 'chord'
  | 'cosmic'
  | 'crystal'
  | 'drop'
  | 'echo'
  | 'flutter'
  | 'glass'
  | 'glow'
  | 'harp'
  | 'luma'
  | 'noir'
  | 'pulse'
  | 'ripple'
  | 'shimmer'
  | 'spark'
  | 'sync'
  | 'wave'
  | 'zen';

export const SOUND_TYPES: { value: SoundType; label: string }[] = [
  { value: 'none', label: 'None' },
  // Modern Apple-like sounds
  { value: 'aurora', label: 'Aurora' },
  { value: 'bamboo', label: 'Bamboo' },
  { value: 'chord', label: 'Chord' },
  { value: 'cosmic', label: 'Cosmic' },
  { value: 'crystal', label: 'Crystal' },
  { value: 'drop', label: 'Drop' },
  { value: 'echo', label: 'Echo' },
  { value: 'flutter', label: 'Flutter' },
  { value: 'glass', label: 'Glass' },
  { value: 'glow', label: 'Glow' },
  { value: 'harp', label: 'Harp' },
  { value: 'luma', label: 'Luma' },
  { value: 'noir', label: 'Noir' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'ripple', label: 'Ripple' },
  { value: 'shimmer', label: 'Shimmer' },
  { value: 'spark', label: 'Spark' },
  { value: 'sync', label: 'Sync' },
  { value: 'wave', label: 'Wave' },
  { value: 'zen', label: 'Zen' },
  // Classic sounds
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

// Sound configurations with frequency, duration, type, and effects
interface SoundConfig {
  frequencies: number[];
  durations: number[];
  types: OscillatorType[];
  gains: number[];
  delays: number[];
}

const SOUND_CONFIGS: Record<string, SoundConfig> = {
  // Modern Apple-like sounds (multi-tone, harmonics)
  aurora: { frequencies: [880, 1108, 1318], durations: [0.15, 0.15, 0.2], types: ['sine', 'sine', 'sine'], gains: [0.2, 0.15, 0.1], delays: [0, 0.05, 0.1] },
  bamboo: { frequencies: [523, 659, 784], durations: [0.1, 0.1, 0.15], types: ['triangle', 'triangle', 'triangle'], gains: [0.25, 0.2, 0.15], delays: [0, 0.08, 0.16] },
  chord: { frequencies: [440, 554, 659], durations: [0.3, 0.3, 0.3], types: ['sine', 'sine', 'sine'], gains: [0.15, 0.12, 0.1], delays: [0, 0, 0] },
  cosmic: { frequencies: [220, 440, 880, 1760], durations: [0.4, 0.3, 0.2, 0.15], types: ['sine', 'sine', 'sine', 'sine'], gains: [0.1, 0.12, 0.08, 0.05], delays: [0, 0.1, 0.2, 0.3] },
  crystal: { frequencies: [2093, 2637, 3136], durations: [0.08, 0.08, 0.12], types: ['sine', 'sine', 'sine'], gains: [0.15, 0.12, 0.1], delays: [0, 0.03, 0.06] },
  drop: { frequencies: [1200, 800, 600], durations: [0.1, 0.1, 0.15], types: ['sine', 'sine', 'sine'], gains: [0.2, 0.18, 0.15], delays: [0, 0.05, 0.1] },
  echo: { frequencies: [660, 660, 660], durations: [0.12, 0.12, 0.15], types: ['sine', 'sine', 'sine'], gains: [0.2, 0.12, 0.06], delays: [0, 0.15, 0.3] },
  flutter: { frequencies: [1047, 1175, 1319, 1397], durations: [0.06, 0.06, 0.06, 0.1], types: ['sine', 'sine', 'sine', 'sine'], gains: [0.15, 0.15, 0.15, 0.12], delays: [0, 0.04, 0.08, 0.12] },
  glass: { frequencies: [1568, 1976, 2349], durations: [0.15, 0.15, 0.2], types: ['sine', 'triangle', 'sine'], gains: [0.12, 0.1, 0.08], delays: [0, 0.02, 0.04] },
  glow: { frequencies: [392, 523, 659], durations: [0.25, 0.25, 0.3], types: ['sine', 'sine', 'sine'], gains: [0.15, 0.15, 0.12], delays: [0, 0.08, 0.16] },
  harp: { frequencies: [523, 659, 784, 1047], durations: [0.2, 0.2, 0.2, 0.25], types: ['triangle', 'triangle', 'triangle', 'triangle'], gains: [0.2, 0.18, 0.15, 0.12], delays: [0, 0.06, 0.12, 0.18] },
  luma: { frequencies: [698, 880, 1047], durations: [0.12, 0.12, 0.18], types: ['sine', 'sine', 'sine'], gains: [0.18, 0.15, 0.12], delays: [0, 0.04, 0.08] },
  noir: { frequencies: [220, 277, 330], durations: [0.2, 0.2, 0.25], types: ['sine', 'sine', 'sine'], gains: [0.2, 0.18, 0.15], delays: [0, 0.1, 0.2] },
  pulse: { frequencies: [440, 880], durations: [0.08, 0.08], types: ['square', 'square'], gains: [0.1, 0.08], delays: [0, 0.1] },
  ripple: { frequencies: [784, 988, 1175, 1319], durations: [0.1, 0.1, 0.1, 0.15], types: ['sine', 'sine', 'sine', 'sine'], gains: [0.15, 0.13, 0.11, 0.09], delays: [0, 0.05, 0.1, 0.15] },
  shimmer: { frequencies: [1319, 1568, 1760, 2093], durations: [0.1, 0.1, 0.1, 0.15], types: ['sine', 'sine', 'sine', 'sine'], gains: [0.12, 0.1, 0.08, 0.06], delays: [0, 0.03, 0.06, 0.09] },
  spark: { frequencies: [2000, 2500, 3000], durations: [0.05, 0.05, 0.08], types: ['sawtooth', 'sawtooth', 'sawtooth'], gains: [0.08, 0.06, 0.04], delays: [0, 0.02, 0.04] },
  sync: { frequencies: [440, 554], durations: [0.1, 0.1], types: ['sine', 'sine'], gains: [0.2, 0.2], delays: [0, 0.12] },
  wave: { frequencies: [330, 392, 494], durations: [0.18, 0.18, 0.22], types: ['sine', 'sine', 'sine'], gains: [0.18, 0.15, 0.12], delays: [0, 0.1, 0.2] },
  zen: { frequencies: [523, 784, 1047], durations: [0.3, 0.3, 0.35], types: ['sine', 'sine', 'sine'], gains: [0.12, 0.1, 0.08], delays: [0, 0.15, 0.3] },
  // Classic sounds
  click: { frequencies: [800], durations: [0.08], types: ['sine'], gains: [0.3], delays: [0] },
  pop: { frequencies: [600], durations: [0.1], types: ['sine'], gains: [0.3], delays: [0] },
  ding: { frequencies: [1000], durations: [0.25], types: ['sine'], gains: [0.25], delays: [0] },
  chime: { frequencies: [880, 1100], durations: [0.2, 0.25], types: ['sine', 'sine'], gains: [0.2, 0.15], delays: [0, 0.1] },
  beep: { frequencies: [440], durations: [0.15], types: ['square'], gains: [0.15], delays: [0] },
  swoosh: { frequencies: [300], durations: [0.2], types: ['sawtooth'], gains: [0.15], delays: [0] },
  bubble: { frequencies: [500, 700], durations: [0.1, 0.15], types: ['sine', 'sine'], gains: [0.25, 0.2], delays: [0, 0.08] },
  ping: { frequencies: [1200], durations: [0.15], types: ['sine'], gains: [0.25], delays: [0] },
  tap: { frequencies: [700], durations: [0.08], types: ['sine'], gains: [0.3], delays: [0] },
  snap: { frequencies: [900], durations: [0.06], types: ['sine'], gains: [0.35], delays: [0] },
  whoosh: { frequencies: [200], durations: [0.25], types: ['sawtooth'], gains: [0.12], delays: [0] },
  blip: { frequencies: [660], durations: [0.1], types: ['sine'], gains: [0.25], delays: [0] },
  notify: { frequencies: [520, 650], durations: [0.12, 0.15], types: ['sine', 'sine'], gains: [0.2, 0.18], delays: [0, 0.08] },
  success: { frequencies: [750, 950], durations: [0.12, 0.18], types: ['sine', 'sine'], gains: [0.22, 0.18], delays: [0, 0.1] },
  alert: { frequencies: [400, 500], durations: [0.15, 0.15], types: ['square', 'square'], gains: [0.15, 0.12], delays: [0, 0.12] },
  unlock: { frequencies: [850, 1050], durations: [0.1, 0.15], types: ['sine', 'sine'], gains: [0.2, 0.18], delays: [0, 0.08] },
  lock: { frequencies: [350, 250], durations: [0.12, 0.15], types: ['sine', 'sine'], gains: [0.22, 0.2], delays: [0, 0.08] },
  power: { frequencies: [1100], durations: [0.12], types: ['sine'], gains: [0.25], delays: [0] },
  switch: { frequencies: [450, 550], durations: [0.08, 0.1], types: ['sine', 'sine'], gains: [0.25, 0.2], delays: [0, 0.06] },
};

export function playNotificationSound(soundType: SoundType) {
  if (soundType === 'none') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const config = SOUND_CONFIGS[soundType];
    
    if (!config) return;
    
    // Play each tone in the sound configuration
    config.frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = config.types[index];
      
      const startTime = audioContext.currentTime + config.delays[index];
      const duration = config.durations[index];
      const gain = config.gains[index];
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.01);
    });
  } catch (e) {
    console.error('Failed to play sound:', e);
  }
}
