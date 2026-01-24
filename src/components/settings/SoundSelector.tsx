import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2, Play, Sparkles, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playNotificationSound, SoundType, SOUND_TYPES } from '@/utils/sound';

// Sound options with emojis grouped by type
export const SOUND_OPTIONS = [
  { id: 'none', name: 'None', emoji: '🔇', category: 'basic' },
  // Modern Apple-like sounds
  { id: 'aurora', name: 'Aurora', emoji: '🌌', category: 'modern' },
  { id: 'bamboo', name: 'Bamboo', emoji: '🎋', category: 'modern' },
  { id: 'chord', name: 'Chord', emoji: '🎹', category: 'modern' },
  { id: 'cosmic', name: 'Cosmic', emoji: '✨', category: 'modern' },
  { id: 'crystal', name: 'Crystal', emoji: '💎', category: 'modern' },
  { id: 'drop', name: 'Drop', emoji: '💧', category: 'modern' },
  { id: 'echo', name: 'Echo', emoji: '🔊', category: 'modern' },
  { id: 'flutter', name: 'Flutter', emoji: '🦋', category: 'modern' },
  { id: 'glass', name: 'Glass', emoji: '🥂', category: 'modern' },
  { id: 'glow', name: 'Glow', emoji: '🌟', category: 'modern' },
  { id: 'harp', name: 'Harp', emoji: '🎻', category: 'modern' },
  { id: 'luma', name: 'Luma', emoji: '💡', category: 'modern' },
  { id: 'noir', name: 'Noir', emoji: '🌑', category: 'modern' },
  { id: 'pulse', name: 'Pulse', emoji: '💓', category: 'modern' },
  { id: 'ripple', name: 'Ripple', emoji: '🌊', category: 'modern' },
  { id: 'shimmer', name: 'Shimmer', emoji: '🪩', category: 'modern' },
  { id: 'spark', name: 'Spark', emoji: '⚡', category: 'modern' },
  { id: 'sync', name: 'Sync', emoji: '🔄', category: 'modern' },
  { id: 'wave', name: 'Wave', emoji: '〰️', category: 'modern' },
  { id: 'zen', name: 'Zen', emoji: '🧘', category: 'modern' },
  // Classic sounds
  { id: 'click', name: 'Click', emoji: '🖱️', category: 'classic' },
  { id: 'pop', name: 'Pop', emoji: '💥', category: 'classic' },
  { id: 'ding', name: 'Ding', emoji: '🔔', category: 'classic' },
  { id: 'chime', name: 'Chime', emoji: '🎵', category: 'classic' },
  { id: 'beep', name: 'Beep', emoji: '📟', category: 'classic' },
  { id: 'swoosh', name: 'Swoosh', emoji: '💨', category: 'classic' },
  { id: 'bubble', name: 'Bubble', emoji: '🫧', category: 'classic' },
  { id: 'ping', name: 'Ping', emoji: '📍', category: 'classic' },
  { id: 'tap', name: 'Tap', emoji: '👆', category: 'classic' },
  { id: 'snap', name: 'Snap', emoji: '🫰', category: 'classic' },
  { id: 'whoosh', name: 'Whoosh', emoji: '🌪️', category: 'classic' },
  { id: 'blip', name: 'Blip', emoji: '🔵', category: 'classic' },
  { id: 'notify', name: 'Notify', emoji: '📱', category: 'classic' },
  { id: 'success', name: 'Success', emoji: '✅', category: 'classic' },
  { id: 'alert', name: 'Alert', emoji: '⚠️', category: 'classic' },
  { id: 'unlock', name: 'Unlock', emoji: '🔓', category: 'classic' },
  { id: 'lock', name: 'Lock', emoji: '🔒', category: 'classic' },
  { id: 'power', name: 'Power', emoji: '⚡', category: 'classic' },
  { id: 'switch', name: 'Switch', emoji: '🎚️', category: 'classic' },
];

interface SoundSelectorProps {
  selectedSound: string;
  onSoundChange: (sound: string) => void;
}

export function SoundSelector({ selectedSound, onSoundChange }: SoundSelectorProps) {
  const playPreview = (soundId: string) => {
    playNotificationSound(soundId as SoundType);
  };

  const modernSounds = SOUND_OPTIONS.filter(s => s.category === 'modern');
  const classicSounds = SOUND_OPTIONS.filter(s => s.category === 'classic');
  const noneOption = SOUND_OPTIONS.find(s => s.id === 'none')!;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5" />
        <Label className="text-base font-medium">Notification Sound</Label>
      </div>
      
      {/* None option */}
      <button
        onClick={() => onSoundChange('none')}
        className={cn(
          "flex items-center gap-2 px-3 py-2 border border-border transition-all text-sm w-full",
          "hover:bg-muted/50",
          selectedSound === 'none' && "bg-muted border-foreground/50"
        )}
      >
        <span className="text-xl">{noneOption.emoji}</span>
        <span className="text-sm">{noneOption.name}</span>
      </button>

      {/* Modern sounds section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span>Modern (Apple-like)</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {modernSounds.map((sound) => (
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
      </div>

      {/* Classic sounds section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Music className="w-4 h-4" />
          <span>Classic</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {classicSounds.map((sound) => (
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
