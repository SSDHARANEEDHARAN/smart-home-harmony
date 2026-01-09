import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mic, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, loading } = useAuth();
  const { settings, updateNotificationSettings, updateVoiceCommandSettings, resetToDefaults } = useSettings();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleReset = () => {
    resetToDefaults();
    toast.success('Settings reset to defaults');
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Customize your notification and voice control preferences
            </p>
          </div>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Notification Preferences */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control which notifications you receive</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="deviceStateChanges">Device State Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when devices turn on or off
                  </p>
                </div>
                <Switch
                  id="deviceStateChanges"
                  checked={settings.notifications.deviceStateChanges}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ deviceStateChanges: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="automationTriggers">Automation Triggers</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when automation rules are triggered
                  </p>
                </div>
                <Switch
                  id="automationTriggers"
                  checked={settings.notifications.automationTriggers}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ automationTriggers: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sceneActivations">Scene Activations</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when scenes are activated
                  </p>
                </div>
                <Switch
                  id="sceneActivations"
                  checked={settings.notifications.sceneActivations}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ sceneActivations: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="soundEnabled">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound with notifications
                  </p>
                </div>
                <Switch
                  id="soundEnabled"
                  checked={settings.notifications.soundEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ soundEnabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice Command Keywords */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <CardTitle>Voice Command Keywords</CardTitle>
                  <CardDescription>Customize voice control trigger phrases</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="turnOnKeyword">Turn On Keyword</Label>
                <Input
                  id="turnOnKeyword"
                  value={settings.voiceCommands.turnOnKeyword}
                  onChange={(e) =>
                    updateVoiceCommandSettings({ turnOnKeyword: e.target.value })
                  }
                  placeholder="e.g., turn on, switch on, enable"
                />
                <p className="text-xs text-muted-foreground">
                  Say "{settings.voiceCommands.turnOnKeyword} [device name]"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="turnOffKeyword">Turn Off Keyword</Label>
                <Input
                  id="turnOffKeyword"
                  value={settings.voiceCommands.turnOffKeyword}
                  onChange={(e) =>
                    updateVoiceCommandSettings({ turnOffKeyword: e.target.value })
                  }
                  placeholder="e.g., turn off, switch off, disable"
                />
                <p className="text-xs text-muted-foreground">
                  Say "{settings.voiceCommands.turnOffKeyword} [device name]"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activateSceneKeyword">Activate Scene Keyword</Label>
                <Input
                  id="activateSceneKeyword"
                  value={settings.voiceCommands.activateSceneKeyword}
                  onChange={(e) =>
                    updateVoiceCommandSettings({ activateSceneKeyword: e.target.value })
                  }
                  placeholder="e.g., activate, start, run"
                />
                <p className="text-xs text-muted-foreground">
                  Say "{settings.voiceCommands.activateSceneKeyword} [scene name]"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setValueKeyword">Set Value Keyword</Label>
                <Input
                  id="setValueKeyword"
                  value={settings.voiceCommands.setValueKeyword}
                  onChange={(e) =>
                    updateVoiceCommandSettings({ setValueKeyword: e.target.value })
                  }
                  placeholder="e.g., set, adjust, change"
                />
                <p className="text-xs text-muted-foreground">
                  Say "{settings.voiceCommands.setValueKeyword} [device] to [value]"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
