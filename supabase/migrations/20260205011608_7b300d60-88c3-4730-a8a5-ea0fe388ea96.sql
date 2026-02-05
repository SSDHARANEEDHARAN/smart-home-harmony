-- Add platform_config column to home_configs table for storing platform-specific configurations
ALTER TABLE public.home_configs 
ADD COLUMN IF NOT EXISTS platform_config jsonb DEFAULT NULL;

-- Add developer_mode_purchased to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS developer_mode_purchased boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS developer_mode_purchased_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_customer_id text DEFAULT NULL;