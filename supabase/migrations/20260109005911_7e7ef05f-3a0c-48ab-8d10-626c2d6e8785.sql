-- Create scenes table for preset automation
CREATE TABLE public.scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Zap',
  description TEXT,
  device_states JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own scenes" 
ON public.scenes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scenes" 
ON public.scenes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenes" 
ON public.scenes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenes" 
ON public.scenes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_scenes_updated_at
BEFORE UPDATE ON public.scenes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();