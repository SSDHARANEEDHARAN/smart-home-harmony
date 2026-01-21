-- Add description column to devices table
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS description text;