-- Start of RLS Policies Setup

-- Enable RLS on all tables
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Providers Table Policies
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

CREATE POLICY "Users can view their own provider profile"
ON providers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider profile"
ON providers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provider profile"
ON providers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public can view verified provider profiles"
ON providers
FOR SELECT
TO anon
USING (is_verified = true);

-- Products Table Policies
CREATE POLICY "Providers can create their own products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM providers
    WHERE user_id = auth.uid()
    AND id = provider_id
  )
);

CREATE POLICY "Providers can update their own products"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM providers
    WHERE user_id = auth.uid()
    AND id = provider_id
  )
);

CREATE POLICY "Providers can delete their own products"
ON products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM providers
    WHERE user_id = auth.uid()
    AND id = provider_id
  )
);

CREATE POLICY "Anyone can view products from verified providers"
ON products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM providers
    WHERE id = provider_id
    AND is_verified = true
  )
);

-- Services Table Policies
CREATE POLICY "Providers can create their own services"
ON services
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM providers
    WHERE user_id = auth.uid()
    AND id = provider_id
  )
);

CREATE POLICY "Providers can update their own services"
ON services
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM providers
    WHERE user_id = auth.uid()
    AND id = provider_id
  )
);

CREATE POLICY "Providers can delete their own services"
ON services
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM providers
    WHERE user_id = auth.uid()
    AND id = provider_id
  )
);

CREATE POLICY "Anyone can view services from verified providers"
ON services
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM providers
    WHERE id = provider_id
    AND is_verified = true
  )
);

-- Bookings Table Policies
CREATE POLICY "Users can create bookings"
ON bookings
FOR INSERT
TO authenticated
WITH CHECK (
  customer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM providers
    WHERE id = provider_id
    AND is_verified = true
  )
);

CREATE POLICY "Users can view their own bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM providers
    WHERE user_id = auth.uid()
    AND id = provider_id
  )
);

CREATE POLICY "Users can update their own bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (
  customer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM providers
    WHERE user_id = auth.uid()
    AND id = provider_id
  )
);

-- Orders Table Policies
CREATE POLICY "Users can create orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (
  customer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM providers
    WHERE id = provider_id
    AND is_verified = true
  )
);

CREATE POLICY "Users can view their own orders"
ON orders
FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM providers
    WHERE user_id = auth.uid()
    AND id = provider_id
  )
);

CREATE POLICY "Users can update their own orders"
ON orders
FOR UPDATE
TO authenticated
USING (
  customer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM providers
    WHERE user_id = auth.uid()
    AND id = provider_id
  )
);

-- Profiles Table Policies
CREATE POLICY "Users can create their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Reviews Table Policies
CREATE POLICY "Authenticated users can create reviews"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (
  reviewer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM providers
    WHERE id = provider_id
    AND is_verified = true
  )
);

CREATE POLICY "Anyone can view reviews"
ON reviews
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Users can update their own reviews"
ON reviews
FOR UPDATE
TO authenticated
USING (reviewer_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
ON reviews
FOR DELETE
TO authenticated
USING (reviewer_id = auth.uid());

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

  -- Policy for profile avatars
  CREATE POLICY "Users can upload profile avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND storage.filename(name) = auth.uid()::text
  );

  CREATE POLICY "Anyone can read profile avatars"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'avatars');
COMMIT;

-- Add security definer functions for common operations
CREATE OR REPLACE FUNCTION get_provider_by_user_id(user_id uuid)
RETURNS providers
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM providers
  WHERE user_id = user_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_user_bookings(user_id uuid)
RETURNS SETOF bookings
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.*
  FROM bookings b
  WHERE b.customer_id = user_id
  OR EXISTS (
    SELECT 1 FROM providers p
    WHERE p.user_id = user_id
    AND p.id = b.provider_id
  );
$$;

-- Function to check if a user can modify a provider
CREATE OR REPLACE FUNCTION can_modify_provider(provider_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM providers
    WHERE id = provider_id
    AND user_id = auth.uid()
  );
END;
$$;
