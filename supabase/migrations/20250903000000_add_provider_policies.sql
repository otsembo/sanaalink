-- Enable Row Level Security
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to create their own provider profile (only one per user)
CREATE POLICY "Users can create their own provider profile"
ON providers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM providers WHERE user_id = auth.uid()
  )
);

-- Policy to allow users to view their own provider profile
CREATE POLICY "Users can view their own provider profile"
ON providers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy to allow users to update their own provider profile
CREATE POLICY "Users can update their own provider profile"
ON providers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own provider profile
CREATE POLICY "Users can delete their own provider profile"
ON providers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy to allow public to view verified provider profiles
CREATE POLICY "Public can view verified provider profiles"
ON providers
FOR SELECT
TO anon
USING (is_verified = true);

-- Storage policies for provider images
BEGIN;
  -- Enable RLS on the storage.objects table
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Policy to allow users to upload their own provider images
  CREATE POLICY "Users can upload provider images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'provider-images'
    AND (
      -- Allow profile images
      (storage.foldername(name) = format('profile/%s', auth.uid()::text))
      OR
      -- Allow portfolio images
      (storage.foldername(name) = format('portfolio/%s', auth.uid()::text))
    )
  );

  -- Policy to allow users to read their own provider images
  CREATE POLICY "Users can read their own provider images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'provider-images'
    AND (
      storage.foldername(name) LIKE format('profile/%s%%', auth.uid()::text)
      OR
      storage.foldername(name) LIKE format('portfolio/%s%%', auth.uid()::text)
    )
  );

  -- Policy to allow public to read verified provider images
  CREATE POLICY "Public can read provider images"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (
    bucket_id = 'provider-images'
    AND (
      EXISTS (
        SELECT 1 FROM providers p
        WHERE p.is_verified = true
        AND (
          p.profile_image LIKE format('%%/%s%%', storage.filename(name))
          OR
          p.portfolio_images::text[] && ARRAY[format('%%/%s', storage.filename(name))]
        )
      )
    )
  );
COMMIT;
