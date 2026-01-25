import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHome, Home, FirebaseConfig } from '@/contexts/HomeContext';
import { FirebaseConfigFields } from '@/components/home/FirebaseConfigFields';
import { OfflineModePanel } from '@/components/settings/OfflineModePanel';
import { useFirebaseConnectionStatus } from '@/hooks/useFirebaseSync';
import { Home as HomeIcon, Plus, Trash2, Pencil, Flame, Wifi, WifiOff, Settings2 } from 'lucide-react';
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

function WorkspaceItem({ 
  home, 
  isActive, 
  isSelected,
  onSelect, 
  onEdit, 
  onDelete, 
  canDelete 
}: { 
  home: Home; 
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const isConnected = useFirebaseConnectionStatus(home.id);
  const hasFirebase = !!(home.firebaseConfig?.apiKey && home.firebaseConfig?.databaseURL);

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
        isSelected
          ? "border-primary bg-primary/10"
          : isActive 
            ? "border-primary/50 bg-primary/5" 
            : "border-border hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          isSelected || isActive ? "bg-primary/20" : "bg-muted"
        )}>
          <HomeIcon className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{home.name}</span>
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {hasFirebase ? (
              <div className={cn(
                "flex items-center gap-1 text-[10px]",
                isConnected ? "text-green-500" : "text-muted-foreground"
              )}>
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span>Firebase Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>Firebase Configured</span>
                  </>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground">No Firebase</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function WorkspaceSettings() {
  const { homes, currentHomeId, setCurrentHomeId, addHome, deleteHome, updateHome } = useHome();
  
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const selectedWorkspace = homes.find(h => h.id === selectedWorkspaceId);
  
  const [activeTab, setActiveTab] = useState('workspaces');
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Edit form state (for inline editing in right panel)
  const [editName, setEditName] = useState('');
  const [editFirebaseConfig, setEditFirebaseConfig] = useState<FirebaseConfig>({});
  
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

  // When clicking edit, select workspace and populate form
  const openEditPanel = (home: Home) => {
    setSelectedWorkspaceId(home.id);
    setEditName(home.name);
    setEditFirebaseConfig(home.firebaseConfig || {});
  };

  const handleSelectWorkspace = (id: string) => {
    setCurrentHomeId(id);
  };

  // Close edit panel
  const closeEditPanel = () => {
    setSelectedWorkspaceId(null);
    setEditName('');
    setEditFirebaseConfig({});
  };

  return (
    <>
      {/* Tabbed Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="workspaces" className="gap-2">
            <HomeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Workspaces</span>
          </TabsTrigger>
          <TabsTrigger value="configuration" className="gap-2">
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Workspace Configuration</span>
          </TabsTrigger>
        </TabsList>

        {/* Workspaces Tab - Dual Panel Layout */}
        <TabsContent value="workspaces">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Panel: Workspace List */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <HomeIcon className="w-5 h-5" />
                      Workspaces
                    </CardTitle>
                    <CardDescription>Manage your home workspaces</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px] lg:h-[400px] pr-2">
                  <div className="space-y-2">
                    {homes.map((home) => (
                      <WorkspaceItem
                        key={home.id}
                        home={home}
                        isActive={home.id === currentHomeId}
                        isSelected={home.id === selectedWorkspaceId}
                        onSelect={() => handleSelectWorkspace(home.id)}
                        onEdit={() => openEditPanel(home)}
                        onDelete={() => setHomeToDelete(home)}
                        canDelete={homes.length > 1}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Right Panel: Edit Workspace Details */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Pencil className="w-5 h-5" />
                  Edit Workspace
                </CardTitle>
                <CardDescription>
                  {selectedWorkspace 
                    ? `Update settings for "${selectedWorkspace.name}"`
                    : 'Select a workspace and click the edit icon to configure'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedWorkspace ? (
                  <ScrollArea className="h-[350px] lg:h-[400px] pr-2">
                    <div className="space-y-4">
                      {/* Workspace Name */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Workspace Name</Label>
                        <Input
                          id="edit-name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="e.g. My Home"
                        />
                      </div>
                      
                      <Separator />
                      
                      {/* Firebase Configuration */}
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Firebase Configuration
                      </div>
                      
                      <FirebaseConfigFields 
                        config={editFirebaseConfig}
                        onChange={setEditFirebaseConfig}
                      />
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={closeEditPanel}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveEdit} 
                          disabled={!editName.trim()}
                          className="flex-1"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-[350px] lg:h-[400px] flex items-center justify-center text-muted-foreground text-sm text-center px-4">
                    <div>
                      <Pencil className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>Click the <Pencil className="w-3.5 h-3.5 inline mx-1" /> icon on a workspace to edit its details and Firebase configuration.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration Tab - Mode Switch & WiFi Only (No Firebase) */}
        <TabsContent value="configuration">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="w-5 h-5" />
                Workspace Configuration
              </CardTitle>
              <CardDescription>
                Configure "{homes.find(h => h.id === currentHomeId)?.name || 'Home'}" settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Offline Mode Configuration - Mode Switch & WiFi */}
              <OfflineModePanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Dialog - Simple name only */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Enter a name for your new workspace. You can configure Firebase settings by editing the workspace after creation.
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
              This action cannot be undone.
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
