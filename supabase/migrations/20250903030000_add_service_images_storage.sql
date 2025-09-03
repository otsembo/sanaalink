-- Enable RLS on storage.objects if not already enabled
BEGIN;

-- Create service-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload service images
CREATE POLICY "Users can upload service images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'service-images'
    AND EXISTS (
        SELECT 1 FROM providers p
        WHERE p.user_id = auth.uid()
    )
);

-- Policy to allow providers to manage their service images
CREATE POLICY "Providers can manage their service images"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'service-images'
    AND EXISTS (
        SELECT 1 FROM providers p
        WHERE p.user_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'service-images'
    AND EXISTS (
        SELECT 1 FROM providers p
        WHERE p.user_id = auth.uid()
    )
);

-- Policy to allow public to view service images
CREATE POLICY "Public can view service images"
ON storage.objects
FOR SELECT
TO anon
USING (
    bucket_id = 'service-images'
);

-- Grant access to the service-images bucket
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Allow public to download images
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.buckets TO anon;

COMMIT;
