import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/useSettings';
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Wifi } from 'lucide-react';
import { ESP32Icon, RaspberryPiIcon, FirebaseIcon, RainMakerIcon, ThingSpeakIcon, MQTTIcon } from '@/components/home/IoTIcons';
import { 
  testThingSpeakConnection, 
  testRainMakerConnection, 
  testMQTTConnection,
  testESP32Connection,
  testRaspberryPiConnection,
  TestResult 
} from '@/services/platformTestService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type PlatformType = 'firebase' | 'esp32' | 'raspberry-pi' | 'esp-rainmaker' | 'thingspeak' | 'mqtt' | null;

export interface PlatformConfig {
  platform: PlatformType;
  // Firebase
  firebaseApiKey?: string;
  firebaseDatabaseURL?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  // ThingSpeak
  thingspeakChannelId?: string;
  thingspeakReadApiKey?: string;
  thingspeakWriteApiKey?: string;
  // MQTT
  mqttBrokerUrl?: string;
  mqttUsername?: string;
  mqttPassword?: string;
  mqttTopic?: string;
  // ESP RainMaker
  rainmakerNodeId?: string;
  rainmakerSecretKey?: string;
  // ESP32
  esp32IpAddress?: string;
  esp32Port?: string;
  // Raspberry Pi
  raspberryPiHost?: string;
  raspberryPiPort?: string;
}

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkspace: (name: string, platformConfig?: PlatformConfig) => void;
}

const FREE_PLATFORMS = [
  {
    id: 'firebase' as PlatformType,
    name: 'Firebase',
    description: 'Google Realtime Database',
    icon: FirebaseIcon,
  },
  {
    id: 'mqtt' as PlatformType,
    name: 'MQTT',
    description: 'Lightweight Messaging Protocol',
    icon: MQTTIcon,
  },
];

const PREMIUM_PLATFORMS = [
  {
    id: 'esp32' as PlatformType,
    name: 'ESP32',
    description: 'Microcontroller with WiFi & Bluetooth',
    icon: ESP32Icon,
    premium: true,
  },
  {
    id: 'raspberry-pi' as PlatformType,
    name: 'Raspberry Pi',
    description: 'Single-board computer for IoT',
    icon: RaspberryPiIcon,
    premium: true,
  },
  {
    id: 'firebase' as PlatformType,
    name: 'Firebase',
    description: 'Google Realtime Database',
    icon: FirebaseIcon,
  },
  {
    id: 'esp-rainmaker' as PlatformType,
    name: 'ESP RainMaker',
    description: 'Espressif IoT Cloud Platform',
    icon: RainMakerIcon,
    premium: true,
  },
  {
    id: 'thingspeak' as PlatformType,
    name: 'ThingSpeak',
    description: 'IoT Analytics Platform',
    icon: ThingSpeakIcon,
    premium: true,
  },
  {
    id: 'mqtt' as PlatformType,
    name: 'MQTT',
    description: 'Lightweight Messaging Protocol',
    icon: MQTTIcon,
  },
];

export function CreateWorkspaceDialog({ open, onOpenChange, onCreateWorkspace }: CreateWorkspaceDialogProps) {
  const { settings } = useSettings();
  const isDeveloperMode = settings.developerMode.enabled && settings.developerMode.paid;
  
  const [step, setStep] = useState<'name' | 'platform' | 'config'>('name');
  const [name, setName] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(null);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({ platform: null });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const availablePlatforms = isDeveloperMode ? PREMIUM_PLATFORMS : FREE_PLATFORMS;

  const handleClose = () => {
    setStep('name');
    setName('');
    setSelectedPlatform(null);
    setPlatformConfig({ platform: null });
    setTestResult(null);
    onOpenChange(false);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    
    if (selectedPlatform) {
      onCreateWorkspace(name.trim(), { ...platformConfig, platform: selectedPlatform });
    } else {
      onCreateWorkspace(name.trim());
    }
    handleClose();
  };

  const handleNameNext = () => {
    if (!name.trim()) return;
    setStep('platform');
  };

  const handlePlatformSelect = (platformId: PlatformType) => {
    setSelectedPlatform(platformId);
    setStep('config');
  };

  const handleBack = () => {
    if (step === 'config') {
      setStep('platform');
      setTestResult(null);
    } else if (step === 'platform') {
      setStep('name');
    }
  };

  const updateConfig = (key: keyof PlatformConfig, value: string) => {
    setPlatformConfig(prev => ({ ...prev, [key]: value }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!selectedPlatform) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      let result: TestResult;
      
      switch (selectedPlatform) {
        case 'thingspeak':
          if (!platformConfig.thingspeakChannelId) {
            result = { success: false, message: 'Channel ID is required' };
          } else {
            result = await testThingSpeakConnection(
              platformConfig.thingspeakChannelId,
              platformConfig.thingspeakReadApiKey
            );
          }
          break;
          
        case 'esp-rainmaker':
          if (!platformConfig.rainmakerNodeId) {
            result = { success: false, message: 'Node ID is required' };
          } else {
            result = await testRainMakerConnection(platformConfig.rainmakerNodeId);
          }
          break;
          
        case 'mqtt':
          if (!platformConfig.mqttBrokerUrl || !platformConfig.mqttTopic) {
            result = { success: false, message: 'Broker URL and Topic are required' };
          } else {
            result = await testMQTTConnection(
              platformConfig.mqttBrokerUrl,
              platformConfig.mqttTopic
            );
          }
          break;
          
        case 'esp32':
          if (!platformConfig.esp32IpAddress) {
            result = { success: false, message: 'IP Address is required' };
          } else {
            result = await testESP32Connection(
              platformConfig.esp32IpAddress,
              platformConfig.esp32Port
            );
          }
          break;
          
        case 'raspberry-pi':
          if (!platformConfig.raspberryPiHost) {
            result = { success: false, message: 'Host address is required' };
          } else {
            result = await testRaspberryPiConnection(
              platformConfig.raspberryPiHost,
              platformConfig.raspberryPiPort
            );
          }
          break;
          
        default:
          result = { success: false, message: 'No test available for this platform' };
      }
      
      setTestResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
      toast.error(error.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === 'name' && (
          <>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Enter a name for your new workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Office, Vacation Home"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleNameNext} disabled={!name.trim()}>
                Next
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'platform' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <DialogTitle>Select Platform</DialogTitle>
                  <DialogDescription>Choose your IoT platform for "{name}"</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {availablePlatforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformSelect(platform.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                      selectedPlatform === platform.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted">
                      <IconComponent className="w-7 h-7 text-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">{platform.name}</p>
                      <p className="text-xs text-muted-foreground">{platform.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button variant="outline" onClick={handleCreate}>Skip & Create</Button>
            </DialogFooter>
          </>
        )}

        {step === 'config' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <DialogTitle>Configure {availablePlatforms.find(p => p.id === selectedPlatform)?.name}</DialogTitle>
                  <DialogDescription>Enter configuration for your platform</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto">
              {renderPlatformConfig(selectedPlatform, platformConfig, updateConfig)}
              
              {/* Test Result Display */}
              {testResult && (
                <div className={cn(
                  "flex items-start gap-2 p-3 rounded-lg border",
                  testResult.success 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-destructive/5 border-destructive/20"
                )}>
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm",
                      testResult.success ? "text-primary" : "text-destructive"
                    )}>
                      {testResult.message}
                    </p>
                    {testResult.latency && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Latency: {testResult.latency}ms
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedPlatform !== 'firebase' && (
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="gap-2"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wifi className="w-4 h-4" />
                  )}
                  Test Connection
                </Button>
              )}
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleCreate}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function renderPlatformConfig(
  platform: PlatformType,
  config: PlatformConfig,
  updateConfig: (key: keyof PlatformConfig, value: string) => void
) {
  switch (platform) {
    case 'firebase':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>API Key *</Label>
            <Input
              value={config.firebaseApiKey || ''}
              onChange={(e) => updateConfig('firebaseApiKey', e.target.value)}
              placeholder="AIzaSy..."
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Database URL *</Label>
            <Input
              value={config.firebaseDatabaseURL || ''}
              onChange={(e) => updateConfig('firebaseDatabaseURL', e.target.value)}
              placeholder="https://xxx.firebaseio.com"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Auth Domain</Label>
            <Input
              value={config.firebaseAuthDomain || ''}
              onChange={(e) => updateConfig('firebaseAuthDomain', e.target.value)}
              placeholder="xxx.firebaseapp.com"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Project ID</Label>
            <Input
              value={config.firebaseProjectId || ''}
              onChange={(e) => updateConfig('firebaseProjectId', e.target.value)}
              placeholder="my-project-id"
              className="font-mono text-sm"
            />
          </div>
        </div>
      );
    
    case 'thingspeak':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Channel ID *</Label>
            <Input
              value={config.thingspeakChannelId || ''}
              onChange={(e) => updateConfig('thingspeakChannelId', e.target.value)}
              placeholder="12345678"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Read API Key</Label>
            <Input
              value={config.thingspeakReadApiKey || ''}
              onChange={(e) => updateConfig('thingspeakReadApiKey', e.target.value)}
              placeholder="XXXXXXXXXXXXXXXX"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Write API Key *</Label>
            <Input
              value={config.thingspeakWriteApiKey || ''}
              onChange={(e) => updateConfig('thingspeakWriteApiKey', e.target.value)}
              placeholder="XXXXXXXXXXXXXXXX"
              className="font-mono text-sm"
            />
          </div>
        </div>
      );
    
    case 'mqtt':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Broker URL *</Label>
            <Input
              value={config.mqttBrokerUrl || ''}
              onChange={(e) => updateConfig('mqttBrokerUrl', e.target.value)}
              placeholder="mqtt://broker.hivemq.com:1883"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Topic *</Label>
            <Input
              value={config.mqttTopic || ''}
              onChange={(e) => updateConfig('mqttTopic', e.target.value)}
              placeholder="home/devices"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={config.mqttUsername || ''}
              onChange={(e) => updateConfig('mqttUsername', e.target.value)}
              placeholder="username"
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={config.mqttPassword || ''}
              onChange={(e) => updateConfig('mqttPassword', e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>
      );
    
    case 'esp-rainmaker':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Node ID *</Label>
            <Input
              value={config.rainmakerNodeId || ''}
              onChange={(e) => updateConfig('rainmakerNodeId', e.target.value)}
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Secret Key</Label>
            <Input
              type="password"
              value={config.rainmakerSecretKey || ''}
              onChange={(e) => updateConfig('rainmakerSecretKey', e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>
      );
    
    case 'esp32':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>ESP32 IP Address *</Label>
            <Input
              value={config.esp32IpAddress || ''}
              onChange={(e) => updateConfig('esp32IpAddress', e.target.value)}
              placeholder="192.168.1.100"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Port</Label>
            <Input
              value={config.esp32Port || ''}
              onChange={(e) => updateConfig('esp32Port', e.target.value)}
              placeholder="80"
              className="font-mono text-sm"
            />
          </div>
        </div>
      );
    
    case 'raspberry-pi':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Host Address *</Label>
            <Input
              value={config.raspberryPiHost || ''}
              onChange={(e) => updateConfig('raspberryPiHost', e.target.value)}
              placeholder="192.168.1.50 or raspberrypi.local"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Port</Label>
            <Input
              value={config.raspberryPiPort || ''}
              onChange={(e) => updateConfig('raspberryPiPort', e.target.value)}
              placeholder="5000"
              className="font-mono text-sm"
            />
          </div>
        </div>
      );
    
    default:
      return null;
  }
}
