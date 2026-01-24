import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Home as HomeIcon, Trash2, Pencil, GripVertical } from 'lucide-react';
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface HomeSelectorProps {
  showEditControls?: boolean;
}

interface Home {
  id: string;
  name: string;
  firebaseConfig?: any;
}

interface SortableHomeItemProps {
  home: Home;
  isActive: boolean;
  showEditControls: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

function SortableHomeItem({ 
  home, 
  isActive, 
  showEditControls, 
  onSelect, 
  onEdit, 
  onDelete,
  canDelete 
}: SortableHomeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: home.id, disabled: !showEditControls });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent group",
        isDragging && "opacity-50 bg-accent"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        {showEditControls && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
        <HomeIcon className="w-4 h-4" />
        <span className="text-sm">{home.name}</span>
      </div>
      
      <div className="flex items-center gap-1">
        {isActive && (
          <span className="text-xs text-primary">Active</span>
        )}
        {showEditControls && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="w-3 h-3" />
            </Button>

            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function HomeSelector({ showEditControls = false }: HomeSelectorProps) {
  const { homes, currentHomeId, setCurrentHomeId, addHome, deleteHome, updateHome, reorderHomes } = useHome();
  const [showAddHome, setShowAddHome] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [newHomeFirebaseConfig, setNewHomeFirebaseConfig] = useState('');
  
  const [homeToDelete, setHomeToDelete] = useState<string | null>(null);
  
  const [showRenameHome, setShowRenameHome] = useState(false);
  const [renameHomeId, setRenameHomeId] = useState<string | null>(null);
  const [renameHomeName, setRenameHomeName] = useState('');
  const [renameHomeFirebaseConfig, setRenameHomeFirebaseConfig] = useState('');

  const currentHome = homes.find((h) => h.id === currentHomeId) || homes[0];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const parseFirebaseConfig = (input: string) => {
    if (!input.trim()) return undefined;
    
    try {
      return JSON.parse(input);
    } catch (e) {
      try {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = homes.findIndex((h) => h.id === active.id);
      const newIndex = homes.findIndex((h) => h.id === over.id);
      const newOrder = arrayMove(homes, oldIndex, newIndex);
      reorderHomes(newOrder);
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={homes.map(h => h.id)}
              strategy={verticalListSortingStrategy}
            >
              {homes.map((home) => (
                <SortableHomeItem
                  key={home.id}
                  home={home}
                  isActive={home.id === currentHomeId}
                  showEditControls={showEditControls}
                  onSelect={() => setCurrentHomeId(home.id)}
                  onEdit={() => {
                    setRenameHomeId(home.id);
                    setRenameHomeName(home.name);
                    setRenameHomeFirebaseConfig(home.firebaseConfig ? JSON.stringify(home.firebaseConfig, null, 2) : '');
                    setShowRenameHome(true);
                  }}
                  onDelete={() => setHomeToDelete(home.id)}
                  canDelete={homes.length > 1}
                />
              ))}
            </SortableContext>
          </DndContext>
          {showEditControls && (
            <>
              <DropdownMenuSeparator />
              <div
                className="flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent text-sm"
                onClick={() => setShowAddHome(true)}
              >
                <Plus className="w-4 h-4" />
                Add New Home
              </div>
            </>
          )}
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