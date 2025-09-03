-- Enable RLS on storage.objects if not already enabled
BEGIN;

-- Create product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload product images
CREATE POLICY "Users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM providers p
        WHERE p.user_id = auth.uid()
    )
);

-- Policy to allow providers to manage their product images
CREATE POLICY "Providers can manage their product images"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM providers p
        WHERE p.user_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM providers p
        WHERE p.user_id = auth.uid()
    )
);

-- Policy to allow public to view product images
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
TO anon
USING (
    bucket_id = 'product-images'
);

COMMIT;
