-- Create enum for device types
CREATE TYPE public.device_type AS ENUM ('light', 'switch', 'fan', 'ac', 'heater', 'camera', 'lock', 'sensor', 'tv', 'appliance');

-- Create enum for toggle styles
CREATE TYPE public.toggle_style AS ENUM ('switch', 'slider', 'button');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'home',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create devices table
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  device_type device_type NOT NULL DEFAULT 'switch',
  is_on BOOLEAN NOT NULL DEFAULT false,
  brightness INTEGER DEFAULT 100 CHECK (brightness >= 0 AND brightness <= 100),
  speed INTEGER DEFAULT 0 CHECK (speed >= 0 AND speed <= 5),
  temperature INTEGER DEFAULT 24 CHECK (temperature >= 16 AND temperature <= 30),
  glow_color TEXT DEFAULT '#00ffff',
  icon TEXT DEFAULT 'power',
  toggle_style toggle_style DEFAULT 'switch',
  power_consumption DECIMAL(10,2) DEFAULT 0,
  api_endpoint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation_rules table
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  trigger_time TIME NOT NULL,
  action TEXT NOT NULL DEFAULT 'toggle',
  target_state BOOLEAN DEFAULT true,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  days_of_week INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create energy_logs table for tracking consumption
CREATE TABLE public.energy_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consumption DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'kWh',
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Rooms policies
CREATE POLICY "Users can view their own rooms" ON public.rooms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rooms" ON public.rooms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rooms" ON public.rooms FOR DELETE USING (auth.uid() = user_id);

-- Devices policies
CREATE POLICY "Users can view their own devices" ON public.devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own devices" ON public.devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own devices" ON public.devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own devices" ON public.devices FOR DELETE USING (auth.uid() = user_id);

-- Automation rules policies
CREATE POLICY "Users can view their own rules" ON public.automation_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own rules" ON public.automation_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rules" ON public.automation_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rules" ON public.automation_rules FOR DELETE USING (auth.uid() = user_id);

-- Energy logs policies
CREATE POLICY "Users can view their own energy logs" ON public.energy_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own energy logs" ON public.energy_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for devices table (for live status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;