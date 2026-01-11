import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { CreateDeviceDialog } from '@/components/devices/CreateDeviceDialog';
import { CreateRoomDialog } from '@/components/rooms/CreateRoomDialog';
import { EditRoomDialog } from '@/components/rooms/EditRoomDialog';
import { useAuth } from '@/hooks/useAuth';
import { useRooms } from '@/hooks/useRooms';
import { useDevices } from '@/hooks/useDevices';
import { Loader2, Cpu, Search, Filter, Trash2, Home, Pencil } from 'lucide-react';
import { Room } from '@/types/smarthome';
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
  const { user, loading: authLoading } = useAuth();
  const { rooms, isLoading: roomsLoading, deleteRoom } = useRooms();
  const { devices, isLoading: devicesLoading, toggleDevice, deleteDevice } = useDevices();

  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [roomDeleteDialogOpen, setRoomDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [editRoomDialogOpen, setEditRoomDialogOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roomsLoading || devicesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(search.toLowerCase());
    const matchesRoom = roomFilter === 'all' || device.room_id === roomFilter;
    const matchesType = typeFilter === 'all' || device.device_type === typeFilter;
    return matchesSearch && matchesRoom && matchesType;
  });

  const handleToggleDevice = (deviceId: string, isOn: boolean) => {
    toggleDevice.mutate({ id: deviceId, is_on: isOn });
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

  // Get devices for each room
  const getDevicesForRoom = (roomId: string) =>
    devices.filter((d) => d.room_id === roomId);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Devices</h1>
              <p className="text-muted-foreground">
                {devices.length} device{devices.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <CreateRoomDialog />
            <CreateDeviceDialog rooms={rooms} />
          </div>
        </div>

        {/* Rooms Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Rooms
          </h2>
          {rooms.length === 0 ? (
            <div className="text-center py-8 glass rounded-xl border border-border/50">
              <Home className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No rooms yet. Create your first room.</p>
              <CreateRoomDialog />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rooms.map((room) => {
                const IconComponent = (LucideIcons as any)[room.icon] || LucideIcons.Home;
                const roomDevices = getDevicesForRoom(room.id);
                const activeCount = roomDevices.filter((d) => d.is_on).length;

                return (
                  <Card
                    key={room.id}
                    className="glass border-border/50 overflow-hidden group"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{room.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {roomDevices.length} device{roomDevices.length !== 1 ? 's' : ''}
                              {roomDevices.length > 0 && ` • ${activeCount} active`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
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
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
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
                    <CardContent className="pt-2">
                      {roomDevices.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {roomDevices.slice(0, 4).map((device) => (
                            <span
                              key={device.id}
                              className={cn(
                                "px-2 py-1 rounded-full text-xs",
                                device.is_on
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {device.name}
                            </span>
                          ))}
                          {roomDevices.length > 4 && (
                            <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                              +{roomDevices.length - 4} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No devices</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Devices Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Devices
          </h2>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
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

          {/* Devices Grid */}
          {filteredDevices.length === 0 ? (
            <div className="text-center py-12 glass rounded-xl border border-border/50">
              <Cpu className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {devices.length === 0 ? 'No devices yet' : 'No matching devices'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {devices.length === 0
                  ? 'Add your first device to get started'
                  : 'Try adjusting your filters'}
              </p>
              {devices.length === 0 && <CreateDeviceDialog rooms={rooms} />}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onToggle={(isOn) => handleToggleDevice(device.id, isOn)}
                  onDelete={() => {
                    setDeviceToDelete(device.id);
                    setDeleteDialogOpen(true);
                  }}
                  showControls
                />
              ))}
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
      </div>
    </Layout>
  );
}