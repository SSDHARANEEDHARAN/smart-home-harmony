import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { CreateDeviceDialog } from '@/components/devices/CreateDeviceDialog';
import { EditDeviceDialog } from '@/components/devices/EditDeviceDialog';
import { CreateRoomDialog } from '@/components/rooms/CreateRoomDialog';
import { EditRoomDialog } from '@/components/rooms/EditRoomDialog';
import { FirebaseStatusBadge } from '@/components/firebase/FirebaseStatusBadge';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useRooms } from '@/hooks/useRooms';
import { useDevices } from '@/hooks/useDevices';
import { useHome } from '@/contexts/HomeContext';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { Loader2, Cpu, Search, Filter, Trash2, Home, Pencil, Power } from 'lucide-react';
import { Room, Device } from '@/types/smarthome';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function Devices() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAppAuth();
  const { rooms, isLoading: roomsLoading, deleteRoom } = useRooms();
  const { devices, isLoading: devicesLoading, toggleDevice, deleteDevice, updateDevice } = useDevices();
  const { getHomeForRoom, currentHomeId } = useHome();

  // Enable Firebase bi-directional sync
  useFirebaseSync();

  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [roomDeleteDialogOpen, setRoomDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [editRoomDialogOpen, setEditRoomDialogOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [editDeviceDialogOpen, setEditDeviceDialogOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roomsLoading || devicesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      </Layout>
    );
  }

  // Filter rooms by current workspace using home_id
  const filteredRooms = rooms.filter((room: any) => 
    room.home_id === currentHomeId || (!room.home_id && currentHomeId === 'home')
  );
  
  // Filter devices by current workspace using home_id
  const workspaceDevices = devices.filter((device: any) => 
    device.home_id === currentHomeId || (!device.home_id && currentHomeId === 'home')
  );
  
  const filteredDevices = workspaceDevices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(search.toLowerCase());
    const matchesRoom = roomFilter === 'all' || device.room_id === roomFilter;
    const matchesType = typeFilter === 'all' || device.device_type === typeFilter;
    return matchesSearch && matchesRoom && matchesType;
  });

  const handleToggleDevice = (deviceId: string, isOn: boolean) => {
    const device = devices.find(d => d.id === deviceId);
    toggleDevice.mutate({ id: deviceId, is_on: isOn, relay_pin: device?.relay_pin });
  };

  const handleValueChange = (deviceId: string, value: number) => {
    updateDevice.mutate({ id: deviceId, brightness: value });
  };

  const handleDeleteDevice = () => {
    if (deviceToDelete) {
      deleteDevice.mutate(deviceToDelete);
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    }
  };

  const handleDeleteRoom = () => {
    if (roomToDelete) {
      deleteRoom.mutate(roomToDelete);
      setRoomDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  const deviceTypes = [...new Set(devices.map((d) => d.device_type))];

  return (
    <Layout>
      <div className="container-responsive py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 header-responsive">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold">Devices</h1>
                <FirebaseStatusBadge variant="compact" />
              </div>
              <p className="text-muted-foreground text-sm">
                {devices.length} device{devices.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <CreateRoomDialog />
            <CreateDeviceDialog rooms={filteredRooms} />
          </div>
        </div>

        {/* Rooms Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <h2 className="font-semibold">Rooms</h2>
          </div>
          {filteredRooms.length === 0 ? (
            <div className="text-center py-6 sm:py-8 glass border border-border/50">
              <Home className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">No rooms in this workspace. Create your first room.</p>
              <CreateRoomDialog />
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRooms.map((room) => {
                const IconComponent = (LucideIcons as any)[room.icon] || LucideIcons.Home;
                const roomDevices = filteredDevices.filter((d) => d.room_id === room.id);
                const activeCount = roomDevices.filter((d) => d.is_on).length;
                const allOn = roomDevices.length > 0 && activeCount === roomDevices.length;
                const activeGlowColor = roomDevices.find(d => d.is_on)?.glow_color || '#ffffff';

                const handleToggleAllInRoom = () => {
                  const targetState = !allOn;
                  roomDevices.forEach((device) => {
                    if (device.is_on !== targetState) {
                      toggleDevice.mutate({ id: device.id, is_on: targetState, relay_pin: device.relay_pin });
                    }
                  });
                };

                return (
                  <Card 
                    key={room.id} 
                    className={cn(
                      "glass border-border/50 overflow-hidden group internal-glow",
                      activeCount > 0 && "glow-active internal-border-glow border-foreground/20"
                    )}
                    style={{
                      '--glow-color': activeGlowColor,
                    } as React.CSSProperties}
                  >
                    <CardHeader className="pb-3">
                      {/* Top row: Icon + Name + Power toggle */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent 
                            className="w-5 h-5 transition-colors"
                            style={{
                              color: activeCount > 0 ? activeGlowColor : undefined,
                            }}
                          />
                          <CardTitle className="text-base">{room.name}</CardTitle>
                        </div>
                        {/* Power toggle for room */}
                        {roomDevices.length > 0 && (
                          <Button
                            variant={allOn ? 'default' : 'outline'}
                            size="icon"
                            onClick={handleToggleAllInRoom}
                            className={cn(
                              "w-8 h-8 rounded-full transition-all duration-300",
                              allOn && "shadow-lg"
                            )}
                            style={{
                              backgroundColor: allOn ? activeGlowColor : undefined,
                              boxShadow: allOn ? `0 0 10px ${activeGlowColor}40` : undefined,
                            }}
                          >
                            <Power className={cn("w-3.5 h-3.5", allOn ? "text-background" : "text-foreground")} />
                          </Button>
                        )}
                      </div>
                      {/* Bottom row: Badge + Edit/Delete buttons */}
                      <div className="flex items-center justify-between mt-3">
                        {/* Active count badge */}
                        {roomDevices.length > 0 ? (
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            activeCount > 0 
                              ? "bg-primary/20 text-primary" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {activeCount}/{roomDevices.length}
                          </span>
                        ) : (
                          <span />
                        )}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setRoomToEdit(room);
                              setEditRoomDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setRoomToDelete(room.id);
                              setRoomDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Devices Section */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <h2 className="font-semibold">Devices</h2>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search devices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {filteredRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {deviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Devices Grid - Grouped by Room */}
          {filteredDevices.length === 0 ? (
            <div className="text-center py-8 sm:py-12 glass border border-border/50">
              <Cpu className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="font-semibold mb-2">
                {devices.length === 0 ? 'No devices yet' : 'No matching devices'}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {devices.length === 0
                  ? 'Add your first device to get started'
                  : 'Try adjusting your filters'}
              </p>
              {devices.length === 0 && <CreateDeviceDialog rooms={filteredRooms} />}
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {filteredRooms.map((room) => {
                if (roomFilter !== 'all' && room.id !== roomFilter) return null;
                
                const roomDevices = filteredDevices.filter((d) => d.room_id === room.id);
                if (roomDevices.length === 0) return null;

                return (
                  <div key={room.id} className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold">{room.name}</h3>
                    <div className="card-grid">
                      {roomDevices.map((device) => (
                        <DeviceCard
                          key={device.id}
                          device={device}
                          onToggle={(isOn) => handleToggleDevice(device.id, isOn)}
                          onValueChange={(value) => handleValueChange(device.id, value)}
                          onEdit={() => {
                            setDeviceToEdit(device);
                            setEditDeviceDialogOpen(true);
                          }}
                          onDelete={() => {
                            setDeviceToDelete(device.id);
                            setDeleteDialogOpen(true);
                          }}
                          showControls
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Unassigned Devices */}
              {filteredDevices.filter(d => !filteredRooms.some(r => r.id === d.room_id)).length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold">Unassigned Devices</h3>
                  <div className="card-grid">
                    {filteredDevices.filter(d => !filteredRooms.some(r => r.id === d.room_id)).map((device) => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onToggle={(isOn) => handleToggleDevice(device.id, isOn)}
                        onValueChange={(value) => handleValueChange(device.id, value)}
                        onEdit={() => {
                          setDeviceToEdit(device);
                          setEditDeviceDialogOpen(true);
                        }}
                        onDelete={() => {
                          setDeviceToDelete(device.id);
                          setDeleteDialogOpen(true);
                        }}
                        showControls
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Device Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="glass border-border/50">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Device</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this device? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDevice}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Room Dialog */}
        <AlertDialog open={roomDeleteDialogOpen} onOpenChange={setRoomDeleteDialogOpen}>
          <AlertDialogContent className="glass border-border/50">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Room</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this room? Devices in this room will become unassigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRoom}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Room Dialog */}
        {roomToEdit && (
          <EditRoomDialog
            room={roomToEdit}
            open={editRoomDialogOpen}
            onOpenChange={(open) => {
              setEditRoomDialogOpen(open);
              if (!open) setRoomToEdit(null);
            }}
          />
        )}

        {/* Edit Device Dialog */}
        {deviceToEdit && (
          <EditDeviceDialog
            device={deviceToEdit}
            rooms={filteredRooms}
            open={editDeviceDialogOpen}
            onOpenChange={(open) => {
              setEditDeviceDialogOpen(open);
              if (!open) setDeviceToEdit(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
