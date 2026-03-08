ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_purchased_at timestamp with time zone DEFAULT NULL;