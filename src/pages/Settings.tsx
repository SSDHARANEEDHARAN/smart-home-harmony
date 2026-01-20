import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mic, RotateCcw, Settings as SettingsIcon, User, Shield, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { TerminalAccess } from '@/components/settings/TerminalAccess';
import { SoundSelector } from '@/components/settings/SoundSelector';

export default function Settings() {
  const { user, loading, signOut } = useAuth();
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

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-foreground/10 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your preferences</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset All
          </Button>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Control which notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="deviceStateChanges" className="font-medium">Device State Changes</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when devices turn on or off
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="automationTriggers" className="font-medium">Automation Triggers</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when automation rules run
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sceneActivations" className="font-medium">Scene Activations</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when scenes are activated
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="soundEnabled" className="font-medium">Sound Effects</Label>
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

                {settings.notifications.soundEnabled && (
                  <>
                    <Separator />
                    <SoundSelector
                      selectedSound={settings.notifications.soundType}
                      onSoundChange={(sound) => updateNotificationSettings({ soundType: sound })}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Tab */}
          <TabsContent value="voice">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Command Keywords
                </CardTitle>
                <CardDescription>Customize voice control trigger phrases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="turnOnKeyword">Turn On Keyword</Label>
                    <Input
                      id="turnOnKeyword"
                      value={settings.voiceCommands.turnOnKeyword}
                      onChange={(e) =>
                        updateVoiceCommandSettings({ turnOnKeyword: e.target.value })
                      }
                      placeholder="e.g., turn on"
                    />
                    <p className="text-xs text-muted-foreground">
                      Say "{settings.voiceCommands.turnOnKeyword} [device]"
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
                      placeholder="e.g., turn off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Say "{settings.voiceCommands.turnOffKeyword} [device]"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activateSceneKeyword">Activate Scene</Label>
                    <Input
                      id="activateSceneKeyword"
                      value={settings.voiceCommands.activateSceneKeyword}
                      onChange={(e) =>
                        updateVoiceCommandSettings({ activateSceneKeyword: e.target.value })
                      }
                      placeholder="e.g., activate"
                    />
                    <p className="text-xs text-muted-foreground">
                      Say "{settings.voiceCommands.activateSceneKeyword} [scene]"
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
                      placeholder="e.g., set"
                    />
                    <p className="text-xs text-muted-foreground">
                      Say "{settings.voiceCommands.setValueKeyword} [device] to [value]"
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Voice Command Examples</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• "{settings.voiceCommands.turnOnKeyword} living room light"</li>
                    <li>• "{settings.voiceCommands.turnOffKeyword} bedroom fan"</li>
                    <li>• "{settings.voiceCommands.activateSceneKeyword} movie night"</li>
                    <li>• "{settings.voiceCommands.setValueKeyword} thermostat to 72"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Theme</Label>
                  <ThemeSwitcher />
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 border border-border text-center">
                    <div className="w-8 h-8 bg-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Primary</p>
                    <p className="text-xs text-muted-foreground">Foreground</p>
                  </div>
                  <div className="p-4 border border-border text-center">
                    <div className="w-8 h-8 bg-background border border-border mx-auto mb-2" />
                    <p className="text-sm font-medium">Background</p>
                    <p className="text-xs text-muted-foreground">Base</p>
                  </div>
                  <div className="p-4 border border-border text-center">
                    <div className="w-8 h-8 bg-muted mx-auto mb-2" />
                    <p className="text-sm font-medium">Muted</p>
                    <p className="text-xs text-muted-foreground">Secondary</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account
                </CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Developer Tools</h4>
                  <TerminalAccess />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Danger Zone</h4>
                  <Button variant="destructive" onClick={handleSignOut} className="w-full sm:w-auto">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
