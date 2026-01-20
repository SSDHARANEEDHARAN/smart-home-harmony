-- Add slider_step column to devices table
ALTER TABLE public.devices 
ADD COLUMN slider_step INTEGER DEFAULT 10 CHECK (slider_step IN (5, 10, 25, 50));