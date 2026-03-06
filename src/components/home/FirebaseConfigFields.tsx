import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FirebaseConfig } from '@/contexts/HomeContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CheckCircle, Flame } from 'lucide-react';

interface FirebaseConfigFieldsProps {
  config: FirebaseConfig;
  onChange: (config: FirebaseConfig) => void;
}

export function FirebaseConfigFields({ config, onChange }: FirebaseConfigFieldsProps) {
  const [pasteValue, setPasteValue] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [animateFields, setAnimateFields] = useState(false);

  const updateField = (field: keyof FirebaseConfig, value: string) => {
    onChange({ ...config, [field]: value || undefined });
  };

  // Trigger animation when config is auto-filled
  useEffect(() => {
    if (showSuccess) {
      setAnimateFields(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setAnimateFields(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const parseAndFillConfig = (input: string) => {
    if (!input.trim()) return;

    try {
      // Try direct JSON parse first
      let parsed: any;
      try {
        parsed = JSON.parse(input);
      } catch {
        // Remove all comments (single-line and multi-line)
        let cleanInput = input
          .replace(/\/\/.*$/gm, '')           // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '')   // Remove multi-line comments
          .replace(/import\s+.*?from\s+['"][^'"]+['"];?/g, '') // Remove import statements
          .replace(/const\s+\w+\s*=\s*initializeApp\([^)]*\);?/g, '') // Remove initializeApp
          .replace(/const\s+\w+\s*=\s*getAnalytics\([^)]*\);?/g, '') // Remove getAnalytics
          .replace(/const\s+\w+\s*=\s*getDatabase\([^)]*\);?/g, '') // Remove getDatabase
          .replace(/const\s+\w+\s*=\s*getAuth\([^)]*\);?/g, '') // Remove getAuth
          .replace(/export\s+/g, '')          // Remove export keywords
          .trim();

        // Find the config object - look for firebaseConfig or any object with apiKey
        const configPatterns = [
          /const\s+firebaseConfig\s*=\s*(\{[\s\S]*?\});?/,
          /const\s+config\s*=\s*(\{[\s\S]*?\});?/,
          /firebaseConfig\s*=\s*(\{[\s\S]*?\});?/,
        ];

        let configMatch: RegExpMatchArray | null = null;
        for (const pattern of configPatterns) {
          configMatch = cleanInput.match(pattern);
          if (configMatch) break;
        }

        let jsonString = '';
        
        if (configMatch) {
          jsonString = configMatch[1];
        } else {
          // Try to find any object containing apiKey
          const markerRegex = /(apiKey|databaseURL)\s*:/;
          const match = cleanInput.match(markerRegex);
          
          if (!match || match.index === undefined) {
            throw new Error('No configuration object found');
          }
          
          // Find the opening brace before the marker
          let startIndex = cleanInput.lastIndexOf('{', match.index);
          if (startIndex === -1) throw new Error('No configuration object found');
          
          // Find the matching closing brace
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
          
          jsonString = cleanInput.substring(startIndex, endIndex);
        }

        // Clean up the JSON string
        jsonString = jsonString
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')  // Quote keys
          .replace(/:\s*'([^']*)'/g, ': "$1"')                     // Single to double quotes
          .replace(/,\s*}/g, '}')                                   // Remove trailing commas
          .replace(/,\s*]/g, ']')                                   // Remove trailing commas in arrays
          .replace(/\n/g, ' ')                                      // Remove newlines
          .replace(/\s+/g, ' ')                                     // Normalize spaces
          .trim();

        parsed = JSON.parse(jsonString);
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
      setShowSuccess(true);
      toast.success('Firebase config auto-filled!');
    } catch (e: any) {
      console.error('Config parse error:', e);
      toast.error('Failed to parse config: ' + e.message);
    }
  };

  return (
    <div className="space-y-3">
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500 animate-scale-in" />
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            Firebase configuration auto-filled successfully!
          </span>
        </div>
      )}

      {/* Paste box for auto-fill */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          Paste Firebase Config (auto-fills fields below)
        </Label>
        <Textarea
          value={pasteValue}
          onChange={(e) => {
            setPasteValue(e.target.value);
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text');
            if (pasted && pasted.trim()) {
              e.preventDefault();
              setPasteValue(pasted);
              setTimeout(() => parseAndFillConfig(pasted), 0);
            }
          }}
          onBlur={() => {
            if (pasteValue.trim() && (pasteValue.includes('apiKey') || pasteValue.includes('databaseURL'))) {
              parseAndFillConfig(pasteValue);
            }
          }}
          placeholder="Paste your Firebase config here (JSON or JS snippet)..."
          className={cn(
            "h-20 text-xs font-mono resize-none transition-all duration-300",
            showSuccess && "border-green-500/50 ring-2 ring-green-500/20"
          )}
        />
      </div>

      <div className={cn(
        "border-t pt-3 transition-all duration-500",
        animateFields && "animate-fade-in"
      )}>
        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          Firebase Configuration (* required for hardware control)
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className={cn(
            "space-y-1 transition-all duration-300",
            animateFields && config.apiKey && "animate-scale-in"
          )}>
            <Label htmlFor="apiKey" className="text-xs">API Key *</Label>
            <Input
              id="apiKey"
              value={config.apiKey || ''}
              onChange={(e) => updateField('apiKey', e.target.value)}
              placeholder="AIzaSy..."
              className={cn(
                "h-8 text-xs font-mono transition-all duration-300",
                animateFields && config.apiKey && "border-green-500/50 bg-green-500/5"
              )}
            />
          </div>
          
          <div className={cn(
            "space-y-1 transition-all duration-300",
            animateFields && config.databaseURL && "animate-scale-in"
          )}>
            <Label htmlFor="databaseURL" className="text-xs">Database URL *</Label>
            <Input
              id="databaseURL"
              value={config.databaseURL || ''}
              onChange={(e) => updateField('databaseURL', e.target.value)}
              placeholder="https://xxx.firebaseio.com"
              className={cn(
                "h-8 text-xs font-mono transition-all duration-300",
                animateFields && config.databaseURL && "border-green-500/50 bg-green-500/5"
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className={cn(
            "space-y-1 transition-all duration-300 delay-75",
            animateFields && config.authDomain && "animate-scale-in"
          )}>
            <Label htmlFor="authDomain" className="text-xs">Auth Domain</Label>
            <Input
              id="authDomain"
              value={config.authDomain || ''}
              onChange={(e) => updateField('authDomain', e.target.value)}
              placeholder="xxx.firebaseapp.com"
              className={cn(
                "h-8 text-xs font-mono transition-all duration-300",
                animateFields && config.authDomain && "border-green-500/50 bg-green-500/5"
              )}
            />
          </div>
          
          <div className={cn(
            "space-y-1 transition-all duration-300 delay-75",
            animateFields && config.projectId && "animate-scale-in"
          )}>
            <Label htmlFor="projectId" className="text-xs">Project ID</Label>
            <Input
              id="projectId"
              value={config.projectId || ''}
              onChange={(e) => updateField('projectId', e.target.value)}
              placeholder="my-project-id"
              className={cn(
                "h-8 text-xs font-mono transition-all duration-300",
                animateFields && config.projectId && "border-green-500/50 bg-green-500/5"
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className={cn(
            "space-y-1 transition-all duration-300 delay-100",
            animateFields && config.storageBucket && "animate-scale-in"
          )}>
            <Label htmlFor="storageBucket" className="text-xs">Storage Bucket</Label>
            <Input
              id="storageBucket"
              value={config.storageBucket || ''}
              onChange={(e) => updateField('storageBucket', e.target.value)}
              placeholder="xxx.appspot.com"
              className={cn(
                "h-8 text-xs font-mono transition-all duration-300",
                animateFields && config.storageBucket && "border-green-500/50 bg-green-500/5"
              )}
            />
          </div>
          
          <div className={cn(
            "space-y-1 transition-all duration-300 delay-100",
            animateFields && config.messagingSenderId && "animate-scale-in"
          )}>
            <Label htmlFor="messagingSenderId" className="text-xs">Messaging Sender ID</Label>
            <Input
              id="messagingSenderId"
              value={config.messagingSenderId || ''}
              onChange={(e) => updateField('messagingSenderId', e.target.value)}
              placeholder="123456789"
              className={cn(
                "h-8 text-xs font-mono transition-all duration-300",
                animateFields && config.messagingSenderId && "border-green-500/50 bg-green-500/5"
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className={cn(
            "space-y-1 transition-all duration-300 delay-150",
            animateFields && config.appId && "animate-scale-in"
          )}>
            <Label htmlFor="appId" className="text-xs">App ID</Label>
            <Input
              id="appId"
              value={config.appId || ''}
              onChange={(e) => updateField('appId', e.target.value)}
              placeholder="1:xxx:web:xxx"
              className={cn(
                "h-8 text-xs font-mono transition-all duration-300",
                animateFields && config.appId && "border-green-500/50 bg-green-500/5"
              )}
            />
          </div>
          
          <div className={cn(
            "space-y-1 transition-all duration-300 delay-150",
            animateFields && config.measurementId && "animate-scale-in"
          )}>
            <Label htmlFor="measurementId" className="text-xs">Measurement ID</Label>
            <Input
              id="measurementId"
              value={config.measurementId || ''}
              onChange={(e) => updateField('measurementId', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className={cn(
                "h-8 text-xs font-mono transition-all duration-300",
                animateFields && config.measurementId && "border-green-500/50 bg-green-500/5"
              )}
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
