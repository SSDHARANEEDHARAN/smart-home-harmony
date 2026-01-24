import { useSettings } from '@/hooks/useSettings';
import { toast } from '@/hooks/use-toast';
import { playNotificationSound, SoundType } from '@/utils/sound';

export function useNotify() {
  const { settings } = useSettings();

  const notifyDeviceStateChange = (deviceName: string, isOn: boolean, source?: 'web' | 'hardware') => {
    if (settings.notifications.deviceStateChanges) {
      const sourceLabel = source === 'hardware' ? ' (via ESP32)' : '';
      toast({
        title: isOn ? '🟢 Device Turned On' : '🔴 Device Turned Off',
        description: `${deviceName} is now ${isOn ? 'on' : 'off'}${sourceLabel}`,
      });
      
      if (settings.notifications.soundEnabled) {
        playNotificationSound(settings.notifications.soundType as SoundType);
      }
    }
  };

  const notifyHardwareTrigger = (deviceName: string, isOn: boolean) => {
    // Always notify for hardware triggers (physical switch) - this is important!
    toast({
      title: '🔌 Hardware Switch Activated',
      description: `${deviceName} was turned ${isOn ? 'on' : 'off'} via physical switch`,
      variant: 'default',
    });
    
    if (settings.notifications.soundEnabled) {
      playNotificationSound(settings.notifications.soundType as SoundType);
    }
  };

  const notifyAutomationTrigger = (automationName: string, action: string) => {
    if (settings.notifications.automationTriggers) {
      toast({
        title: '⚡ Automation Triggered',
        description: `${automationName}: ${action}`,
      });
      
      if (settings.notifications.soundEnabled) {
        playNotificationSound(settings.notifications.soundType as SoundType);
      }
    }
  };

  const notifySceneActivation = (sceneName: string) => {
    if (settings.notifications.sceneActivations) {
      toast({
        title: '🎬 Scene Activated',
        description: `${sceneName} has been activated`,
      });
      
      if (settings.notifications.soundEnabled) {
        playNotificationSound(settings.notifications.soundType as SoundType);
      }
    }
  };

  return {
    notifyDeviceStateChange,
    notifyHardwareTrigger,
    notifyAutomationTrigger,
    notifySceneActivation,
  };
}
