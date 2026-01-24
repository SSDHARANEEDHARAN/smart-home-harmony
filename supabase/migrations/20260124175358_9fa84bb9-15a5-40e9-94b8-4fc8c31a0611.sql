-- Create a table to log relay/device state changes with source tracking
CREATE TABLE public.relay_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  relay_pin INTEGER,
  device_name TEXT,
  previous_state BOOLEAN,
  new_state BOOLEAN NOT NULL,
  source TEXT NOT NULL DEFAULT 'web', -- 'web' or 'hardware'
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.relay_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own relay history" 
ON public.relay_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create relay history entries" 
ON public.relay_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own relay history" 
ON public.relay_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_relay_history_user_id ON public.relay_history(user_id);
CREATE INDEX idx_relay_history_device_id ON public.relay_history(device_id);
CREATE INDEX idx_relay_history_triggered_at ON public.relay_history(triggered_at DESC);