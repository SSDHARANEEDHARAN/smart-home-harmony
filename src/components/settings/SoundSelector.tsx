import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SOUND_OPTIONS = [
  { id: 'none', name: 'None', emoji: '🔇' },
  { id: 'click', name: 'Click', emoji: '🖱️' },
  { id: 'pop', name: 'Pop', emoji: '💥' },
  { id: 'ding', name: 'Ding', emoji: '🔔' },
  { id: 'chime', name: 'Chime', emoji: '🎵' },
  { id: 'beep', name: 'Beep', emoji: '📟' },
  { id: 'swoosh', name: 'Swoosh', emoji: '💨' },
  { id: 'bubble', name: 'Bubble', emoji: '🫧' },
  { id: 'ping', name: 'Ping', emoji: '📍' },
  { id: 'tap', name: 'Tap', emoji: '👆' },
  { id: 'snap', name: 'Snap', emoji: '🫰' },
  { id: 'whoosh', name: 'Whoosh', emoji: '🌪️' },
  { id: 'blip', name: 'Blip', emoji: '🔵' },
  { id: 'notify', name: 'Notify', emoji: '📱' },
  { id: 'success', name: 'Success', emoji: '✅' },
  { id: 'alert', name: 'Alert', emoji: '⚠️' },
  { id: 'unlock', name: 'Unlock', emoji: '🔓' },
  { id: 'lock', name: 'Lock', emoji: '🔒' },
  { id: 'power', name: 'Power', emoji: '⚡' },
  { id: 'switch', name: 'Switch', emoji: '🎚️' },
];

interface SoundSelectorProps {
  selectedSound: string;
  onSoundChange: (sound: string) => void;
}

export function SoundSelector({ selectedSound, onSoundChange }: SoundSelectorProps) {
  const playPreview = (soundId: string) => {
    // Create a simple beep sound for preview
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different sounds
    const frequencies: Record<string, number> = {
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
    
    oscillator.frequency.value = frequencies[soundId] || 440;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5" />
        <Label className="text-base font-medium">Notification Sound</Label>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {SOUND_OPTIONS.map((sound) => (
          <button
            key={sound.id}
            onClick={() => onSoundChange(sound.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 border border-border transition-all text-sm",
              "hover:bg-muted/50",
              selectedSound === sound.id && "bg-muted border-foreground/50"
            )}
          >
            <span className="text-xl">{sound.emoji}</span>
            <span className="text-xs truncate w-full text-center">{sound.name}</span>
          </button>
        ))}
      </div>
      {selectedSound !== 'none' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => playPreview(selectedSound)}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Preview Sound
        </Button>
      )}
    </div>
  );
}
