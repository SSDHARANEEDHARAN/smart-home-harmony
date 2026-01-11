-- Add relay_pin column to devices table
ALTER TABLE public.devices ADD COLUMN relay_pin INTEGER;

-- Add constraint to ensure relay_pin is between 1 and 1000
ALTER TABLE public.devices ADD CONSTRAINT relay_pin_range CHECK (relay_pin IS NULL OR (relay_pin >= 1 AND relay_pin <= 1000));