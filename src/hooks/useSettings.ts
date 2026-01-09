import { useState, useEffect } from 'react';

export interface NotificationSettings {
  deviceStateChanges: boolean;
  automationTriggers: boolean;
  sceneActivations: boolean;
  soundEnabled: boolean;
}

export interface VoiceCommandSettings {
  turnOnKeyword: string;
  turnOffKeyword: string;
  activateSceneKeyword: string;
  setValueKeyword: string;
}

export interface AppSettings {
  notifications: NotificationSettings;
  voiceCommands: VoiceCommandSettings;
}

const defaultSettings: AppSettings = {
  notifications: {
    deviceStateChanges: true,
    automationTriggers: true,
    sceneActivations: true,
    soundEnabled: false,
  },
  voiceCommands: {
    turnOnKeyword: 'turn on',
    turnOffKeyword: 'turn off',
    activateSceneKeyword: 'activate',
    setValueKeyword: 'set',
  },
};

const SETTINGS_KEY = 'smarthome_settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateNotificationSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates },
    }));
  };

  const updateVoiceCommandSettings = (updates: Partial<VoiceCommandSettings>) => {
    setSettings(prev => ({
      ...prev,
      voiceCommands: { ...prev.voiceCommands, ...updates },
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return {
    settings,
    updateNotificationSettings,
    updateVoiceCommandSettings,
    resetToDefaults,
  };
}
