-- Drop existing functions to recreate them properly
DROP FUNCTION IF EXISTS get_provider_by_user_id(uuid);
DROP FUNCTION IF EXISTS get_user_bookings(uuid);
DROP FUNCTION IF EXISTS can_modify_provider(uuid);

-- Create provider role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'provider_role'
  ) THEN
    CREATE ROLE provider_role;
  END IF;
END
$$;

-- Grant necessary permissions to authenticated users
GRANT usage ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Create proper security definer functions with parameter checks
CREATE OR REPLACE FUNCTION get_provider_by_user_id(lookup_user_id uuid)
RETURNS SETOF providers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT p.*
  FROM providers p
  WHERE p.user_id = lookup_user_id
  AND (
    -- Allow if it's the user's own profile
    p.user_id = auth.uid()
    OR
    -- Allow if the provider is verified
    p.is_verified = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_user_bookings(lookup_user_id uuid)
RETURNS SETOF bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF auth.uid() != lookup_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT b.*
  FROM bookings b
  WHERE b.customer_id = lookup_user_id
  OR EXISTS (
    SELECT 1 FROM providers p
    WHERE p.user_id = lookup_user_id
    AND p.id = b.provider_id
  );
END;
$$;

-- Function to check if user is a provider
CREATE OR REPLACE FUNCTION is_provider()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM providers
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Function to check if a user can modify a provider
CREATE OR REPLACE FUNCTION can_modify_provider(target_provider_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM providers
    WHERE id = target_provider_id
    AND user_id = auth.uid()
  );
END;
$$;

-- Function to safely insert a new provider
CREATE OR REPLACE FUNCTION insert_provider(
  provider_data jsonb
)
RETURNS providers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_provider providers;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user already has a provider profile
  IF EXISTS (
    SELECT 1 FROM providers WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User already has a provider profile';
  END IF;

  -- Insert the new provider
  INSERT INTO providers (
    user_id,
    name,
    email,
    phone,
    whatsapp,
    business_name,
    location,
    bio,
    profile_image,
    portfolio_images,
    preferred_contact,
    category,
    sub_category,
    is_verified
  )
  SELECT
    auth.uid(),
    provider_data->>'name',
    provider_data->>'email',
    provider_data->>'phone',
    COALESCE(provider_data->>'whatsapp', provider_data->>'phone'),
    provider_data->>'business_name',
    provider_data->>'location',
    provider_data->>'bio',
    provider_data->>'profile_image',
    COALESCE((provider_data->>'portfolio_images')::jsonb->0, '[]')::text[],
    (provider_data->>'preferred_contact')::text,
    provider_data->>'category',
    provider_data->>'sub_category',
    false
  RETURNING * INTO new_provider;

  RETURN new_provider;
END;
$$;

-- Revoke direct table access
REVOKE ALL ON providers FROM anon, authenticated;
REVOKE ALL ON products FROM anon, authenticated;
REVOKE ALL ON services FROM anon, authenticated;
REVOKE ALL ON bookings FROM anon, authenticated;
REVOKE ALL ON orders FROM anon, authenticated;
REVOKE ALL ON reviews FROM anon, authenticated;

-- Grant specific access through RLS policies
GRANT SELECT ON providers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON providers TO authenticated;

GRANT SELECT ON products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;

GRANT SELECT ON services TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON services TO authenticated;

GRANT SELECT ON bookings TO authenticated;
GRANT INSERT, UPDATE ON bookings TO authenticated;

GRANT SELECT ON orders TO authenticated;
GRANT INSERT, UPDATE ON orders TO authenticated;

GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON reviews TO authenticated;

-- Grant usage of sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
