import { useState, useRef, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHome, Home, FirebaseConfig } from '@/contexts/HomeContext';
import { useFirebaseConnectionStatus } from '@/hooks/useFirebaseSync';
import { useSettings } from '@/hooks/useSettings';
import { Home as HomeIcon, Plus, Pencil, X, Flame, Wifi, WifiOff, Loader2, CheckCircle, AlertCircle, Copy, Info, ExternalLink, Download, Upload, Trash2 } from 'lucide-react';
import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CreateWorkspaceDialog, PlatformConfig } from './CreateWorkspaceDialog';

function ConnectionStatusDot({ isConnected, hasFirebase }: { isConnected: boolean; hasFirebase: boolean }) {
  if (!hasFirebase) return null;
  
  return (
    <span 
      className={cn(
        "w-2 h-2 rounded-full inline-block",
        isConnected ? "bg-green-500" : "bg-orange-500"
      )}
      title={isConnected ? "Connected" : "Disconnected"}
    />
  );
}

function WorkspaceRow({ 
  home, 
  isActive, 
  isDefault,
  onEdit,
  onDelete
}: { 
  home: Home; 
  isActive: boolean;
  isDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isConnected = useFirebaseConnectionStatus(home.id);
  const hasFirebase = !!(home.firebaseConfig?.apiKey && home.firebaseConfig?.databaseURL);
  const isMobile = useIsMobile();

  // Swipe state
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 100;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || isDefault) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setIsSwiping(false);
  }, [isMobile, isDefault]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || isDefault) return;
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 10) setIsSwiping(true);
    const clamped = Math.max(0, Math.min(diff, MAX_SWIPE));
    setSwipeOffset(clamped);
  }, [isMobile, isDefault]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || isDefault) return;
    if (swipeOffset >= SWIPE_THRESHOLD) {
      setSwipeOffset(MAX_SWIPE);
    } else {
      setSwipeOffset(0);
    }
    setTimeout(() => setIsSwiping(false), 50);
  }, [isMobile, isDefault, swipeOffset]);

  const resetSwipe = useCallback(() => setSwipeOffset(0), []);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete action behind */}
      {isMobile && !isDefault && (
        <div className="absolute inset-y-0 right-0 flex items-center bg-destructive rounded-r-lg z-0">
          <button
            className="h-full px-5 flex items-center justify-center text-destructive-foreground touch-manipulation"
            onClick={() => { resetSwipe(); onDelete(); }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Card content */}
      <div
        ref={rowRef}
        className="relative z-10 flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border border-border/40 bg-card min-h-[48px] transition-transform"
        style={{
          transform: isMobile ? `translateX(-${swipeOffset}px)` : undefined,
          transition: isSwiping ? 'none' : 'transform 0.25s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (swipeOffset > 0) { resetSwipe(); return; }
          onEdit();
        }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
            <HomeIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{home.name}</span>
              {isDefault && (
                <span className="text-[10px] leading-none px-1.5 py-[3px] rounded-full bg-muted/50 text-muted-foreground font-medium whitespace-nowrap">
                  Default
                </span>
              )}
              {isActive && (
                <span className="text-[10px] leading-none px-1.5 py-[3px] rounded-full bg-primary/15 text-primary font-medium whitespace-nowrap">
                  Active
                </span>
              )}
              <ConnectionStatusDot isConnected={isConnected} hasFirebase={hasFirebase} />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {hasFirebase ? (
                isConnected ? (
                  <span className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    <span className="hidden xs:inline">Firebase</span> Connected
                  </span>
                ) : (
                  <span className="text-[11px] text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    <span className="hidden xs:inline">Firebase</span> Disconnected
                  </span>
                )
              ) : (
                <span className="text-[11px] text-muted-foreground">No Firebase</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 ml-2">
          {!isMobile && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 touch-manipulation"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              {!isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              )}
            </>
          )}
          {isMobile && (
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

const FIREBASE_RULES = `{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}`;

export function WorkspaceSettings() {
  const { homes, currentHomeId, setCurrentHomeId, addHome, deleteHome, updateHome } = useHome();
  const { settings } = useSettings();
  const isDeveloperMode = settings.developerMode.enabled && settings.developerMode.paid;
  
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const selectedWorkspace = homes.find(h => h.id === selectedWorkspaceId);
  const isConnected = useFirebaseConnectionStatus(selectedWorkspaceId || '');
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editFirebaseConfig, setEditFirebaseConfig] = useState<FirebaseConfig>({});
  const [pasteValue, setPasteValue] = useState('');
  
  const [homeToDelete, setHomeToDelete] = useState<Home | null>(null);
  
  // Test connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  
  // Import file input ref
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (newName.trim()) {
      addHome(newName.trim());
      setNewName('');
      setShowAddDialog(false);
    }
  };

  const handleCreateWorkspace = (name: string, platformConfig?: PlatformConfig) => {
    if (platformConfig?.platform === 'firebase') {
      // If Firebase platform selected, create with Firebase config
      const firebaseConfig: FirebaseConfig = {
        apiKey: platformConfig.firebaseApiKey,
        databaseURL: platformConfig.firebaseDatabaseURL,
        authDomain: platformConfig.firebaseAuthDomain,
        projectId: platformConfig.firebaseProjectId,
      };
      addHome(name, firebaseConfig);
      toast.success(`Workspace "${name}" created with Firebase!`);
    } else if (platformConfig?.platform) {
      // For other platforms, store platform config
      const platformData: Record<string, any> = {
        platform: platformConfig.platform,
        ...platformConfig,
      };
      addHome(name, undefined, platformData);
      toast.success(`Workspace "${name}" created with ${platformConfig.platform}!`);
    } else {
      addHome(name);
      toast.success(`Workspace "${name}" created!`);
    }
  };

  const handleSaveEdit = () => {
    if (selectedWorkspaceId && editName.trim()) {
      const hasConfig = editFirebaseConfig.apiKey && editFirebaseConfig.databaseURL;
      updateHome(selectedWorkspaceId, editName.trim(), hasConfig ? editFirebaseConfig : undefined);
      toast.success('Workspace saved successfully!');
      closeEditPanel();
    }
  };

  const handleDelete = () => {
    if (homeToDelete) {
      deleteHome(homeToDelete.id);
      if (selectedWorkspaceId === homeToDelete.id) {
        setSelectedWorkspaceId(null);
      }
      setHomeToDelete(null);
    }
  };

  const openEditPanel = (home: Home) => {
    setSelectedWorkspaceId(home.id);
    setEditName(home.name);
    setEditFirebaseConfig(home.firebaseConfig || {});
    setPasteValue('');
    setCurrentHomeId(home.id);
    setTestResult(null);
  };

  const closeEditPanel = () => {
    setSelectedWorkspaceId(null);
    setEditName('');
    setEditFirebaseConfig({});
    setPasteValue('');
    setTestResult(null);
  };

  const updateField = (field: keyof FirebaseConfig, value: string) => {
    setEditFirebaseConfig(prev => ({ ...prev, [field]: value || undefined }));
    setTestResult(null);
  };

  const testFirebaseConnection = async () => {
    if (!editFirebaseConfig.apiKey || !editFirebaseConfig.databaseURL) {
      toast.error('API Key and Database URL are required');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    let testApp: FirebaseApp | null = null;

    try {
      // Create a temporary Firebase app for testing
      testApp = initializeApp({
        apiKey: editFirebaseConfig.apiKey,
        authDomain: editFirebaseConfig.authDomain,
        databaseURL: editFirebaseConfig.databaseURL,
        projectId: editFirebaseConfig.projectId,
        storageBucket: editFirebaseConfig.storageBucket,
        messagingSenderId: editFirebaseConfig.messagingSenderId,
        appId: editFirebaseConfig.appId,
        measurementId: editFirebaseConfig.measurementId,
      }, `test-${Date.now()}`);

      const db = getDatabase(testApp);
      const testRef = ref(db, '.info/connected');
      await get(testRef);
      
      setTestResult('success');
      toast.success('Firebase connection successful!');
    } catch (error: any) {
      console.error('Firebase test error:', error);
      setTestResult('error');
      toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
    } finally {
      // Clean up the test app
      if (testApp) {
        try {
          await deleteApp(testApp);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      setIsTesting(false);
    }
  };

  const copyRulesToClipboard = () => {
    navigator.clipboard.writeText(FIREBASE_RULES);
    toast.success('Rules copied to clipboard!');
  };

  // Export all workspaces to JSON
  const handleExportWorkspaces = () => {
    const exportData = homes.map(home => ({
      id: home.id,
      name: home.name,
      position: home.position,
      firebaseConfig: home.firebaseConfig ? {
        apiKey: home.firebaseConfig.apiKey,
        authDomain: home.firebaseConfig.authDomain,
        databaseURL: home.firebaseConfig.databaseURL,
        projectId: home.firebaseConfig.projectId,
        storageBucket: home.firebaseConfig.storageBucket,
        messagingSenderId: home.firebaseConfig.messagingSenderId,
        appId: home.firebaseConfig.appId,
        measurementId: home.firebaseConfig.measurementId,
        // Note: Auth credentials are intentionally excluded for security
      } : null,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspaces-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Workspaces exported successfully!');
  };

  // Import workspaces from JSON
  const handleImportWorkspaces = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        if (!Array.isArray(importedData)) {
          throw new Error('Invalid format: expected an array');
        }

        let imported = 0;
        importedData.forEach((workspace: any) => {
          if (!workspace.name) return;
          
          // Check if workspace already exists by name
          const exists = homes.some(h => h.name === workspace.name);
          if (!exists) {
            addHome(workspace.name, workspace.firebaseConfig || undefined);
            imported++;
          }
        });

        if (imported > 0) {
          toast.success(`Imported ${imported} workspace(s)`);
        } else {
          toast.info('No new workspaces to import');
        }
      } catch (error: any) {
        console.error('Import error:', error);
        toast.error('Failed to import: ' + error.message);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  const parseAndFillConfig = (input: string) => {
    if (!input.trim()) return;

    try {
      let parsed: any;
      try {
        parsed = JSON.parse(input);
      } catch {
        let cleanInput = input
          .replace(/\/\/.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/import\s+.*?from\s+['"][^'"]+['"];?/g, '')
          .replace(/const\s+\w+\s*=\s*initializeApp\([^)]*\);?/g, '')
          .replace(/const\s+\w+\s*=\s*getAnalytics\([^)]*\);?/g, '')
          .replace(/const\s+\w+\s*=\s*getDatabase\([^)]*\);?/g, '')
          .replace(/const\s+\w+\s*=\s*getAuth\([^)]*\);?/g, '')
          .replace(/export\s+/g, '')
          .trim();

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
          const markerRegex = /(apiKey|databaseURL)\s*:/;
          const match = cleanInput.match(markerRegex);
          
          if (!match || match.index === undefined) {
            throw new Error('No configuration object found');
          }
          
          let startIndex = cleanInput.lastIndexOf('{', match.index);
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
          
          jsonString = cleanInput.substring(startIndex, endIndex);
        }

        jsonString = jsonString
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
          .replace(/:\s*'([^']*)'/g, ': "$1"')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        parsed = JSON.parse(jsonString);
      }

      setEditFirebaseConfig(prev => ({
        ...prev,
        apiKey: parsed.apiKey || prev.apiKey,
        authDomain: parsed.authDomain || prev.authDomain,
        databaseURL: parsed.databaseURL || prev.databaseURL,
        projectId: parsed.projectId || prev.projectId,
        storageBucket: parsed.storageBucket || prev.storageBucket,
        messagingSenderId: parsed.messagingSenderId || prev.messagingSenderId,
        appId: parsed.appId || prev.appId,
        measurementId: parsed.measurementId || prev.measurementId,
      }));

      setPasteValue('');
      setTestResult(null);
      toast.success('Firebase config auto-filled!');
    } catch (e: any) {
      console.error('Config parse error:', e);
      toast.error('Failed to parse config: ' + e.message);
    }
  };

  const hasFirebaseConfig = !!(editFirebaseConfig.apiKey && editFirebaseConfig.databaseURL);

  return (
    <>
      {/* Main Workspaces Card */}
      <Card className="border-border/50">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              <div>
                <h2 className="font-semibold text-sm sm:text-base">Workspaces</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage your home workspaces</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                onChange={handleImportWorkspaces}
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 text-xs sm:text-sm"
                onClick={() => importInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 text-xs sm:text-sm"
                onClick={handleExportWorkspaces}
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-1 sm:gap-1.5 h-8 px-2.5 sm:px-3 text-xs sm:text-sm">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Add</span>
              </Button>
            </div>
          </div>

          {/* Workspace List */}
          <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
            {homes.map((home, index) => (
              <WorkspaceRow
                key={home.id}
                home={home}
                isActive={home.id === currentHomeId}
                isDefault={index === 0}
                onEdit={() => openEditPanel(home)}
                onDelete={() => setHomeToDelete(home)}
              />
            ))}
          </div>

          {/* Edit Panel - Shows BELOW workspace list when selected */}
          {selectedWorkspace && (
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="p-3 sm:p-6">
                {/* Edit Header with Connection Status */}
                <div className="flex items-start justify-between mb-3 sm:mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base">Edit Workspace</h3>
                      {hasFirebaseConfig && (
                        <div className="flex items-center gap-1.5">
                          <ConnectionStatusDot 
                            isConnected={isConnected} 
                            hasFirebase={hasFirebaseConfig} 
                          />
                          <span className={cn(
                            "text-xs",
                            isConnected ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                          )}>
                            {isConnected ? "Connected" : "Disconnected"}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Update workspace settings and Firebase configuration.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mt-1 -mr-2"
                    onClick={closeEditPanel}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Workspace Name */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-name" className="text-sm font-medium">Workspace Name</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g. My Home"
                        className="h-9"
                      />
                    </div>

                    {/* Firebase Configuration Paste */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Firebase Configuration
                      </Label>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
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
                          className="h-24 text-xs font-mono resize-none"
                        />
                      </div>
                    </div>

                    {/* Test Connection Button */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testFirebaseConnection}
                        disabled={!hasFirebaseConfig || isTesting}
                        className="gap-2"
                      >
                        {isTesting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : testResult === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : testResult === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Wifi className="w-4 h-4" />
                        )}
                        Test Connection
                      </Button>
                      {testResult === 'success' && (
                        <span className="text-xs text-green-600 dark:text-green-400">Connection verified!</span>
                      )}
                      {testResult === 'error' && (
                        <span className="text-xs text-red-600 dark:text-red-400">Connection failed</span>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Firebase Fields */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Firebase Configuration (* required for hardware control)
                    </Label>

                    {/* Firebase Fields Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="apiKey" className="text-xs">API Key *</Label>
                        <Input
                          id="apiKey"
                          value={editFirebaseConfig.apiKey || ''}
                          onChange={(e) => updateField('apiKey', e.target.value)}
                          placeholder="AIzaSy..."
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="databaseURL" className="text-xs">Database URL *</Label>
                        <Input
                          id="databaseURL"
                          value={editFirebaseConfig.databaseURL || ''}
                          onChange={(e) => updateField('databaseURL', e.target.value)}
                          placeholder="https://xxx.firebaseio.co"
                          className="h-8 text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="authDomain" className="text-xs">Auth Domain</Label>
                        <Input
                          id="authDomain"
                          value={editFirebaseConfig.authDomain || ''}
                          onChange={(e) => updateField('authDomain', e.target.value)}
                          placeholder="xxx.firebaseapp.com"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="projectId" className="text-xs">Project ID</Label>
                        <Input
                          id="projectId"
                          value={editFirebaseConfig.projectId || ''}
                          onChange={(e) => updateField('projectId', e.target.value)}
                          placeholder="my-project-id"
                          className="h-8 text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="storageBucket" className="text-xs">Storage Bucket</Label>
                        <Input
                          id="storageBucket"
                          value={editFirebaseConfig.storageBucket || ''}
                          onChange={(e) => updateField('storageBucket', e.target.value)}
                          placeholder="xxx.appspot.com"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="messagingSenderId" className="text-xs">Messaging Sender ID</Label>
                        <Input
                          id="messagingSenderId"
                          value={editFirebaseConfig.messagingSenderId || ''}
                          onChange={(e) => updateField('messagingSenderId', e.target.value)}
                          placeholder="123456789"
                          className="h-8 text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="appId" className="text-xs">App ID</Label>
                        <Input
                          id="appId"
                          value={editFirebaseConfig.appId || ''}
                          onChange={(e) => updateField('appId', e.target.value)}
                          placeholder="1:xxx:web:xxx"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="measurementId" className="text-xs">Measurement ID</Label>
                        <Input
                          id="measurementId"
                          value={editFirebaseConfig.measurementId || ''}
                          onChange={(e) => updateField('measurementId', e.target.value)}
                          placeholder="G-XXXXXXXXXX"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Firebase Authentication */}
                    <div className="pt-2">
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Firebase Authentication (for secured databases)
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="authEmail" className="text-xs">Auth Email</Label>
                          <Input
                            id="authEmail"
                            type="email"
                            value={editFirebaseConfig.authEmail || ''}
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
                            value={editFirebaseConfig.authPassword || ''}
                            onChange={(e) => updateField('authPassword', e.target.value)}
                            placeholder="••••••••"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={closeEditPanel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Firebase Setup Help Notice */}
          <Alert className="mt-6 border-orange-500/30 bg-orange-500/5">
            <Info className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-sm">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-foreground">How to set up Firebase Realtime Database:</span>
                </div>
                
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground text-xs">
                  <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a> and create a new project</li>
                  <li>Navigate to <strong>Build → Realtime Database</strong> and click "Create Database"</li>
                  <li>Go to <strong>Rules</strong> tab and paste the following rules:</li>
                </ol>

                <div className="relative">
                  <pre className="bg-muted/80 p-3 rounded-md text-xs font-mono overflow-x-auto">
                    {FIREBASE_RULES}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-7 gap-1.5 text-xs"
                    onClick={copyRulesToClipboard}
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                </div>

                <ol start={4} className="list-decimal list-inside space-y-1.5 text-muted-foreground text-xs">
                  <li>Go to <strong>Project Settings → General</strong> and add a Web App</li>
                  <li>Copy the Firebase config and paste it above</li>
                  <li>Enable <strong>Authentication → Email/Password</strong> if you want secured access</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Add Dialog - Developer Mode uses enhanced dialog */}
      {isDeveloperMode ? (
        <CreateWorkspaceDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onCreateWorkspace={handleCreateWorkspace}
        />
      ) : (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Enter a name for your new workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Workspace Name</Label>
                <Input
                  id="new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Office, Vacation Home"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!newName.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!homeToDelete} onOpenChange={(open) => !open && setHomeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{homeToDelete?.name}" workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
