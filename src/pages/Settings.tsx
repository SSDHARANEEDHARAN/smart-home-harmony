import { Layout } from '@/components/layout/Layout';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useSettings } from '@/hooks/useSettings';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mic, RotateCcw, Settings as SettingsIcon, User, Shield, Palette, Moon, Sun, Laptop, Terminal, Volume2, Play, Home, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useState } from 'react';
import { SOUND_TYPES, playNotificationSound, SoundType } from '@/utils/sound';
import { WorkspaceSettings } from '@/components/settings/WorkspaceSettings';
import { DeveloperModeSection } from '@/components/settings/DeveloperModeSection';
import { PaymentHistorySection } from '@/components/settings/PaymentHistorySection';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Settings() {
  const { user, loading, signOut } = useAppAuth();
  const { settings, updateNotificationSettings, updateVoiceCommandSettings, resetToDefaults } = useSettings();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [passkeyOpen, setPasskeyOpen] = useState(false);
  const [passkey, setPasskey] = useState('');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="animate-pulse text-muted-foreground">Loading...</p>
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
    const { error } = await signOut();
    if (error) {
      toast.error(error.message || 'Failed to sign out');
      return;
    }
    toast.success('Signed out successfully');
  };

  const handleTerminalCheck = () => {
    if (passkey === '1234567890') {
      setPasskeyOpen(false);
      window.open('/terminal', '_blank');
    } else {
      toast.error('Invalid passkey');
    }
  };

  return (
    <Layout>
      <div className="container-responsive py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="header-responsive mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-foreground/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </div>
            <div>
              <h1 className="font-bold">Settings</h1>
              <p className="text-muted-foreground text-sm">Manage your preferences</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleReset} className="gap-2" size="sm">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset All</span>
            <span className="sm:hidden">Reset</span>
          </Button>
        </div>

        <Tabs defaultValue="workspaces" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="workspaces" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Workspaces</span>
              <span className="xs:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Notify</span>
              <span className="xs:hidden">Notify</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
              <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Voice</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Theme</span>
              <span className="xs:hidden">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Workspaces Tab */}
          <TabsContent value="workspaces">
            <WorkspaceSettings />
          </TabsContent>

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
                  <div className="space-y-4 pt-4">
                    <Label className="font-medium">Notification Sound</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SOUND_TYPES.map((sound) => (
                        <div
                          key={sound.value}
                          className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${
                            settings.notifications.soundType === sound.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => {
                            updateNotificationSettings({ soundType: sound.value });
                            playNotificationSound(sound.value);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4" />
                            {sound.label}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              playNotificationSound(sound.value);
                            }}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
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
                  <Label className="font-medium">Theme Mode</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      onClick={() => setTheme('system')}
                    >
                      <Laptop className="w-4 h-4" />
                      System
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Device colors can be customized on the Devices page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Developer Mode Section */}
            <DeveloperModeSection />

            {/* Payment History */}
            <PaymentHistorySection />

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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Terminal Check</Label>
                    <p className="text-sm text-muted-foreground">
                      Access system terminal logs and relay status
                    </p>
                  </div>
                  <Button variant="outline" className="gap-2" onClick={() => setPasskeyOpen(true)}>
                    <Terminal className="w-4 h-4" />
                    Open Terminal
                  </Button>
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

        <Dialog open={passkeyOpen} onOpenChange={setPasskeyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Passkey</DialogTitle>
              <DialogDescription>
                Please enter the administrator passkey to access the terminal.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="password"
              placeholder="Enter passkey..."
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTerminalCheck()}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setPasskeyOpen(false)}>Cancel</Button>
              <Button onClick={handleTerminalCheck}>Access Terminal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
