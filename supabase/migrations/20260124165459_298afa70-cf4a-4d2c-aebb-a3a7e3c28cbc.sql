-- Create table for storing home/workspace configurations per user
CREATE TABLE public.home_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  home_id TEXT NOT NULL,
  name TEXT NOT NULL,
  firebase_config JSONB,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, home_id)
);

-- Enable Row Level Security
ALTER TABLE public.home_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own home configs" 
ON public.home_configs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own home configs" 
ON public.home_configs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own home configs" 
ON public.home_configs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own home configs" 
ON public.home_configs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_home_configs_updated_at
BEFORE UPDATE ON public.home_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();