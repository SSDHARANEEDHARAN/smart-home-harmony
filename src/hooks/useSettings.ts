import { useState, useEffect } from 'react';

export interface NotificationSettings {
  deviceStateChanges: boolean;
  automationTriggers: boolean;
  sceneActivations: boolean;
  soundEnabled: boolean;
  soundType: string;
}

export interface VoiceCommandSettings {
  turnOnKeyword: string;
  turnOffKeyword: string;
  activateSceneKeyword: string;
  setValueKeyword: string;
}

export interface DeveloperModeSettings {
  enabled: boolean;
  paid: boolean;
  paidAt?: string;
}

export interface AppSettings {
  notifications: NotificationSettings;
  voiceCommands: VoiceCommandSettings;
  developerMode: DeveloperModeSettings;
}

const defaultSettings: AppSettings = {
  notifications: {
    deviceStateChanges: true,
    automationTriggers: true,
    sceneActivations: true,
    soundEnabled: false,
    soundType: 'ding',
  },
  voiceCommands: {
    turnOnKeyword: 'turn on',
    turnOffKeyword: 'turn off',
    activateSceneKeyword: 'activate',
    setValueKeyword: 'set',
  },
  developerMode: {
    enabled: false,
    paid: false,
  },
};

const SETTINGS_KEY = 'smarthome_settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultSettings,
        ...parsed,
        developerMode: { ...defaultSettings.developerMode, ...parsed.developerMode },
      };
    }
    return defaultSettings;
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

  const updateDeveloperModeSettings = (updates: Partial<DeveloperModeSettings>) => {
    setSettings(prev => ({
      ...prev,
      developerMode: { ...prev.developerMode, ...updates },
    }));
  };

  const activateDeveloperMode = () => {
    setSettings(prev => ({
      ...prev,
      developerMode: {
        enabled: true,
        paid: true,
        paidAt: new Date().toISOString(),
      },
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return {
    settings,
    updateNotificationSettings,
    updateVoiceCommandSettings,
    updateDeveloperModeSettings,
    activateDeveloperMode,
    resetToDefaults,
  };
}
