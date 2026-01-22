import { useSettings } from '@/hooks/useSettings';
import { toast } from '@/hooks/use-toast';
import { playNotificationSound, SoundType } from '@/utils/sound';

export function useNotify() {
  const { settings } = useSettings();

  const notifyDeviceStateChange = (deviceName: string, isOn: boolean) => {
    if (settings.notifications.deviceStateChanges) {
      toast({
        title: isOn ? '🟢 Device Turned On' : '🔴 Device Turned Off',
        description: `${deviceName} is now ${isOn ? 'on' : 'off'}`,
      });
      
      if (settings.notifications.soundEnabled) {
        playNotificationSound(settings.notifications.soundType as SoundType);
      }
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
    notifyAutomationTrigger,
    notifySceneActivation,
  };
}
