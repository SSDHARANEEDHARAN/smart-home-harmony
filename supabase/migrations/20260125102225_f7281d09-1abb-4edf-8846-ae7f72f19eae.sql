-- Add home_id to rooms table to link rooms to workspaces
ALTER TABLE public.rooms ADD COLUMN home_id text DEFAULT 'home';

-- Add home_id to devices table to link devices directly to workspaces
ALTER TABLE public.devices ADD COLUMN home_id text DEFAULT 'home';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_home_id ON public.rooms(home_id);
CREATE INDEX IF NOT EXISTS idx_devices_home_id ON public.devices(home_id);