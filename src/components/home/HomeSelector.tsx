import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Home as HomeIcon, Trash2, Pencil } from 'lucide-react';
import { useHome } from '@/contexts/HomeContext';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

export function HomeSelector() {
  const { homes, currentHomeId, setCurrentHomeId, addHome, deleteHome, updateHome } = useHome();
  const [showAddHome, setShowAddHome] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [newHomeFirebaseConfig, setNewHomeFirebaseConfig] = useState('');
  
  const [homeToDelete, setHomeToDelete] = useState<string | null>(null);
  
  const [showRenameHome, setShowRenameHome] = useState(false);
  const [renameHomeId, setRenameHomeId] = useState<string | null>(null);
  const [renameHomeName, setRenameHomeName] = useState('');
  const [renameHomeFirebaseConfig, setRenameHomeFirebaseConfig] = useState('');

  const currentHome = homes.find((h) => h.id === currentHomeId) || homes[0];

  const parseFirebaseConfig = (input: string) => {
    if (!input.trim()) return undefined;
    
    try {
      // First try standard JSON parse
      return JSON.parse(input);
    } catch (e) {
      // If that fails, try to parse JS object snippet
      try {
        // Remove comments first
        let cleanInput = input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Find the start of the object
        const markerRegex = /(apiKey|projectId|authDomain)\s*:/;
        const match = cleanInput.match(markerRegex);
        
        let startIndex = -1;
        if (match && match.index !== undefined) {
          startIndex = cleanInput.lastIndexOf('{', match.index);
        } else {
          startIndex = cleanInput.indexOf('{');
        }
        
        if (startIndex === -1) throw new Error('No configuration object found');
        
        // Find the matching closing brace by counting
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
        
        // Quote keys that aren't quoted
        cleanJson = cleanJson.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":');
        
        // Fix single quotes to double quotes for values
        cleanJson = cleanJson.replace(/:\s*'([^']*)'/g, ': "$1"');
        
        // Remove trailing commas
        cleanJson = cleanJson.replace(/,\s*}/g, '}');
        cleanJson = cleanJson.replace(/,\s*]/g, ']');

        return JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('Failed to parse config', parseError);
        throw new Error('Invalid Configuration Format. Please ensure it is a valid JSON object or the standard Firebase config snippet.');
      }
    }
  };

  const handleAddHome = () => {
    if (newHomeName.trim()) {
      let config = undefined;
      if (newHomeFirebaseConfig.trim()) {
        try {
          config = parseFirebaseConfig(newHomeFirebaseConfig);
        } catch (e: any) {
          toast.error(e.message);
          return;
        }
      }

      addHome(newHomeName.trim(), config);
      setNewHomeName('');
      setNewHomeFirebaseConfig('');
      setShowAddHome(false);
    }
  };

  const handleDeleteHome = (id: string) => {
    deleteHome(id);
    setHomeToDelete(null);
  };

  const handleRenameHome = () => {
    if (renameHomeId && renameHomeName.trim()) {
      let config = undefined;
      if (renameHomeFirebaseConfig.trim()) {
        try {
          config = parseFirebaseConfig(renameHomeFirebaseConfig);
        } catch (e: any) {
          toast.error(e.message);
          return;
        }
      }

      updateHome(renameHomeId, renameHomeName.trim(), config);
      setShowRenameHome(false);
      setRenameHomeId(null);
      setRenameHomeName('');
      setRenameHomeFirebaseConfig('');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <HomeIcon className="w-4 h-4" />
            {currentHome?.name || 'Select Home'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-popover border-border">
          <DropdownMenuLabel>My Homes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {homes.map((home) => (
            <DropdownMenuItem
              key={home.id}
              onClick={() => setCurrentHomeId(home.id)}
              className="gap-2 justify-between group"
            >
              <div className="flex items-center gap-2">
                <HomeIcon className="w-4 h-4" />
                {home.name}
              </div>
              
              <div className="flex items-center gap-1">
                {home.id === currentHomeId && (
                  <span className="text-xs text-primary">Active</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameHomeId(home.id);
                    setRenameHomeName(home.name);
                    setRenameHomeFirebaseConfig(home.firebaseConfig ? JSON.stringify(home.firebaseConfig, null, 2) : '');
                    setShowRenameHome(true);
                  }}
                >
                  <Pencil className="w-3 h-3" />
                </Button>

                {homes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHomeToDelete(home.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowAddHome(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Home
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAddHome} onOpenChange={setShowAddHome}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Home</DialogTitle>
            <DialogDescription>
              Create a new workspace for your devices and rooms.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="home-name" className="text-right">
                Name
              </Label>
              <Input
                id="home-name"
                value={newHomeName}
                onChange={(e) => setNewHomeName(e.target.value)}
                placeholder="e.g. Vacation Home"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="firebase-config" className="text-right pt-2">
                Firebase Config (JSON)
              </Label>
              <Textarea
                id="firebase-config"
                value={newHomeFirebaseConfig}
                onChange={(e) => setNewHomeFirebaseConfig(e.target.value)}
                placeholder='Paste Firebase Config (JSON or JS snippet)'
                className="col-span-3 h-32 font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddHome}>Create Home</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenameHome} onOpenChange={setShowRenameHome}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Home</DialogTitle>
            <DialogDescription>
              Enter a new name for this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rename-name" className="text-right">
                Name
              </Label>
              <Input
                id="rename-name"
                value={renameHomeName}
                onChange={(e) => setRenameHomeName(e.target.value)}
                placeholder="e.g. My Home"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="rename-firebase-config" className="text-right pt-2">
                Firebase Config (JSON)
              </Label>
              <Textarea
                id="rename-firebase-config"
                value={renameHomeFirebaseConfig}
                onChange={(e) => setRenameHomeFirebaseConfig(e.target.value)}
                placeholder='Paste Firebase Config (JSON or JS snippet)'
                className="col-span-3 h-32 font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRenameHome}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!homeToDelete} onOpenChange={(open) => !open && setHomeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Home?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{homes.find(h => h.id === homeToDelete)?.name}" and hide its rooms.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => homeToDelete && handleDeleteHome(homeToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
