-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', false);

-- Allow authenticated users to upload their own payment screenshots
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to view their own screenshots
CREATE POLICY "Users can view their own payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add screenshot_url column to payment_transactions
ALTER TABLE public.payment_transactions ADD COLUMN IF NOT EXISTS screenshot_url text;