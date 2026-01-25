import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useHome, Home, FirebaseConfig } from '@/contexts/HomeContext';
import { useFirebaseConnectionStatus } from '@/hooks/useFirebaseSync';
import { Home as HomeIcon, Plus, Pencil, X, Flame } from 'lucide-react';
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

function WorkspaceRow({ 
  home, 
  isActive, 
  onEdit
}: { 
  home: Home; 
  isActive: boolean;
  onEdit: () => void;
}) {
  const isConnected = useFirebaseConnectionStatus(home.id);
  const hasFirebase = !!(home.firebaseConfig?.apiKey && home.firebaseConfig?.databaseURL);

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <HomeIcon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{home.name}</span>
            {isActive && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                Active
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {hasFirebase 
              ? isConnected 
                ? 'Firebase Connected' 
                : 'Firebase Configured'
              : 'No Firebase'
            }
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onEdit}
      >
        <Pencil className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function WorkspaceSettings() {
  const { homes, currentHomeId, setCurrentHomeId, addHome, deleteHome, updateHome } = useHome();
  
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const selectedWorkspace = homes.find(h => h.id === selectedWorkspaceId);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editFirebaseConfig, setEditFirebaseConfig] = useState<FirebaseConfig>({});
  const [pasteValue, setPasteValue] = useState('');
  
  const [homeToDelete, setHomeToDelete] = useState<Home | null>(null);

  const handleAdd = () => {
    if (newName.trim()) {
      addHome(newName.trim());
      setNewName('');
      setShowAddDialog(false);
    }
  };

  const handleSaveEdit = () => {
    if (selectedWorkspaceId && editName.trim()) {
      const hasConfig = editFirebaseConfig.apiKey && editFirebaseConfig.databaseURL;
      updateHome(selectedWorkspaceId, editName.trim(), hasConfig ? editFirebaseConfig : undefined);
      toast.success('Workspace updated');
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
  };

  const closeEditPanel = () => {
    setSelectedWorkspaceId(null);
    setEditName('');
    setEditFirebaseConfig({});
    setPasteValue('');
  };

  const updateField = (field: keyof FirebaseConfig, value: string) => {
    setEditFirebaseConfig(prev => ({ ...prev, [field]: value || undefined }));
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
      toast.success('Firebase config auto-filled!');
    } catch (e: any) {
      console.error('Config parse error:', e);
      toast.error('Failed to parse config: ' + e.message);
    }
  };

  return (
    <>
      {/* Main Workspaces Card */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              <div>
                <h2 className="font-semibold text-base">Workspaces</h2>
                <p className="text-sm text-muted-foreground">Manage your home workspaces</p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {/* Workspace List */}
          <div className="space-y-2 mb-6">
            {homes.map((home) => (
              <WorkspaceRow
                key={home.id}
                home={home}
                isActive={home.id === currentHomeId}
                onEdit={() => openEditPanel(home)}
              />
            ))}
          </div>

          {/* Edit Panel - Shows when workspace is selected */}
          {selectedWorkspace && (
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="p-6">
                {/* Edit Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-base">Edit Workspace</h3>
                    <p className="text-sm text-muted-foreground">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </CardContent>
      </Card>

      {/* Add Dialog */}
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
