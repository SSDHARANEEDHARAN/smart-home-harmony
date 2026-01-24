import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FirebaseConfig } from '@/contexts/HomeContext';

interface FirebaseConfigFieldsProps {
  config: FirebaseConfig;
  onChange: (config: FirebaseConfig) => void;
}

export function FirebaseConfigFields({ config, onChange }: FirebaseConfigFieldsProps) {
  const updateField = (field: keyof FirebaseConfig, value: string) => {
    onChange({ ...config, [field]: value || undefined });
  };

  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-muted-foreground mb-2">
        Firebase Configuration (for hardware relay control)
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="apiKey" className="text-xs">API Key *</Label>
          <Input
            id="apiKey"
            value={config.apiKey || ''}
            onChange={(e) => updateField('apiKey', e.target.value)}
            placeholder="AIzaSy..."
            className="h-8 text-xs font-mono"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="databaseURL" className="text-xs">Database URL *</Label>
          <Input
            id="databaseURL"
            value={config.databaseURL || ''}
            onChange={(e) => updateField('databaseURL', e.target.value)}
            placeholder="https://xxx.firebaseio.com"
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="authDomain" className="text-xs">Auth Domain</Label>
          <Input
            id="authDomain"
            value={config.authDomain || ''}
            onChange={(e) => updateField('authDomain', e.target.value)}
            placeholder="xxx.firebaseapp.com"
            className="h-8 text-xs font-mono"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="projectId" className="text-xs">Project ID</Label>
          <Input
            id="projectId"
            value={config.projectId || ''}
            onChange={(e) => updateField('projectId', e.target.value)}
            placeholder="my-project-id"
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="storageBucket" className="text-xs">Storage Bucket</Label>
          <Input
            id="storageBucket"
            value={config.storageBucket || ''}
            onChange={(e) => updateField('storageBucket', e.target.value)}
            placeholder="xxx.appspot.com"
            className="h-8 text-xs font-mono"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="messagingSenderId" className="text-xs">Messaging Sender ID</Label>
          <Input
            id="messagingSenderId"
            value={config.messagingSenderId || ''}
            onChange={(e) => updateField('messagingSenderId', e.target.value)}
            placeholder="123456789"
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="appId" className="text-xs">App ID</Label>
          <Input
            id="appId"
            value={config.appId || ''}
            onChange={(e) => updateField('appId', e.target.value)}
            placeholder="1:xxx:web:xxx"
            className="h-8 text-xs font-mono"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="measurementId" className="text-xs">Measurement ID</Label>
          <Input
            id="measurementId"
            value={config.measurementId || ''}
            onChange={(e) => updateField('measurementId', e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Firebase Authentication (optional)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="authEmail" className="text-xs">Auth Email</Label>
            <Input
              id="authEmail"
              type="email"
              value={config.authEmail || ''}
              onChange={(e) => updateField('authEmail', e.target.value)}
              placeholder="user@example.com"
              className="h-8 text-xs"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="authPassword" className="text-xs">Auth Password</Label>
            <Input
              id="authPassword"
              type="password"
              value={config.authPassword || ''}
              onChange={(e) => updateField('authPassword', e.target.value)}
              placeholder="••••••••"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
