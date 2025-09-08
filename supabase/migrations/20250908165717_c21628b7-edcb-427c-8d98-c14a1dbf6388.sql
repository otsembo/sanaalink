-- Fix domain_configs table missing RLS policies
ALTER TABLE public.domain_configs ENABLE ROW LEVEL SECURITY;

-- Users can manage their own domain configs
CREATE POLICY "Providers can manage their own domain configs"
ON public.domain_configs
FOR ALL
USING (
  auth.uid() IN (
    SELECT providers.user_id FROM public.providers 
    WHERE providers.id = domain_configs.provider_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT providers.user_id FROM public.providers 
    WHERE providers.id = domain_configs.provider_id
  )
);

-- Public can view verified domain configs  
CREATE POLICY "Public can view verified domain configs"
ON public.domain_configs
FOR SELECT
USING (is_verified = true);

-- Grant necessary permissions on domain_configs
GRANT SELECT, INSERT, UPDATE ON TABLE public.domain_configs TO authenticated;

-- Fix the function search_path issues by updating existing functions
CREATE OR REPLACE FUNCTION public.get_provider_by_user_id(lookup_user_id uuid)
RETURNS SETOF providers
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT p.*
  FROM public.providers p
  WHERE p.user_id = lookup_user_id
  AND (
    -- Allow if it's the user's own profile
    p.user_id = auth.uid()
    OR
    -- Allow if the provider is verified
    p.is_verified = true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_bookings(lookup_user_id uuid)
RETURNS SETOF bookings
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF auth.uid() != lookup_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT b.*
  FROM public.bookings b
  WHERE b.customer_id = lookup_user_id
  OR EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.user_id = lookup_user_id
    AND p.id = b.provider_id
  );
END;
$function$;