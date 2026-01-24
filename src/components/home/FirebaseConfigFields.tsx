import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FirebaseConfig } from '@/contexts/HomeContext';
import { useState } from 'react';
import { toast } from 'sonner';

interface FirebaseConfigFieldsProps {
  config: FirebaseConfig;
  onChange: (config: FirebaseConfig) => void;
}

export function FirebaseConfigFields({ config, onChange }: FirebaseConfigFieldsProps) {
  const [pasteValue, setPasteValue] = useState('');

  const updateField = (field: keyof FirebaseConfig, value: string) => {
    onChange({ ...config, [field]: value || undefined });
  };

  const parseAndFillConfig = (input: string) => {
    if (!input.trim()) return;

    try {
      // Try direct JSON parse first
      let parsed: any;
      try {
        parsed = JSON.parse(input);
      } catch {
        // Try to extract config object from JS code
        let cleanInput = input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        
        const markerRegex = /(apiKey|projectId|authDomain)\s*:/;
        const match = cleanInput.match(markerRegex);
        
        let startIndex = -1;
        if (match && match.index !== undefined) {
          startIndex = cleanInput.lastIndexOf('{', match.index);
        } else {
          startIndex = cleanInput.indexOf('{');
        }
        
        if (startIndex === -1) throw new Error('No configuration object found');
        
        let balance = 0;
        let endIndex = -1;
        for (let i = startIndex; i < cleanInput.length; i++) {
          if (cleanInput[i] === '{') balance++;
          else if (cleanInput[i] === '}') {
            balance--;
            if (balance === 0) {
              endIndex = i + 1;
              break;
            }
          }
        }
        
        if (endIndex === -1) throw new Error('Unbalanced braces');
        
        let cleanJson = cleanInput.substring(startIndex, endIndex);
        cleanJson = cleanJson.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":');
        cleanJson = cleanJson.replace(/:\s*'([^']*)'/g, ': "$1"');
        cleanJson = cleanJson.replace(/,\s*}/g, '}');
        cleanJson = cleanJson.replace(/,\s*]/g, ']');

        parsed = JSON.parse(cleanJson);
      }

      // Auto-fill the fields
      const newConfig: FirebaseConfig = {
        ...config,
        apiKey: parsed.apiKey || config.apiKey,
        authDomain: parsed.authDomain || config.authDomain,
        databaseURL: parsed.databaseURL || config.databaseURL,
        projectId: parsed.projectId || config.projectId,
        storageBucket: parsed.storageBucket || config.storageBucket,
        messagingSenderId: parsed.messagingSenderId || config.messagingSenderId,
        appId: parsed.appId || config.appId,
        measurementId: parsed.measurementId || config.measurementId,
      };

      onChange(newConfig);
      setPasteValue('');
      toast.success('Firebase config auto-filled!');
    } catch (e: any) {
      toast.error('Failed to parse config: ' + e.message);
    }
  };

  return (
    <div className="space-y-3">
      {/* Paste box for auto-fill */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">
          Paste Firebase Config (auto-fills fields below)
        </Label>
        <Textarea
          value={pasteValue}
          onChange={(e) => {
            setPasteValue(e.target.value);
            if (e.target.value.includes('apiKey')) {
              parseAndFillConfig(e.target.value);
            }
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text');
            setTimeout(() => parseAndFillConfig(pasted), 50);
          }}
          placeholder="Paste your Firebase config here (JSON or JS snippet)..."
          className="h-20 text-xs font-mono resize-none"
        />
      </div>

      <div className="border-t pt-3">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Firebase Configuration (* required for hardware control)
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

        <div className="grid grid-cols-2 gap-3 mt-3">
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

        <div className="grid grid-cols-2 gap-3 mt-3">
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

        <div className="grid grid-cols-2 gap-3 mt-3">
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
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Firebase Authentication (for secured databases)
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
