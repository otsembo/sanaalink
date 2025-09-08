-- Fix remaining function search path issues
CREATE OR REPLACE FUNCTION public.is_provider()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.providers
    WHERE user_id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_modify_provider(target_provider_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.providers
    WHERE id = target_provider_id
    AND user_id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_provider(provider_data jsonb)
RETURNS providers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_provider providers;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user already has a provider profile
  IF EXISTS (
    SELECT 1 FROM public.providers WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User already has a provider profile';
  END IF;

  -- Insert the new provider
  INSERT INTO public.providers (
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
$function$;

CREATE OR REPLACE FUNCTION public.enforce_response_only()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  -- Allow updates only if response or response_at is changed
  IF NEW.response IS DISTINCT FROM OLD.response
     OR NEW.response_at IS DISTINCT FROM OLD.response_at THEN
    -- Everything else must remain unchanged
    IF (NEW.provider_id = OLD.provider_id)
       AND (NEW.customer_id = OLD.customer_id)
       AND (NEW.service_id IS NOT DISTINCT FROM OLD.service_id)
       AND (NEW.product_id IS NOT DISTINCT FROM OLD.product_id)
       AND (NEW.rating = OLD.rating)
       AND (NEW.comment = OLD.comment)
       AND (NEW.images IS NOT DISTINCT FROM OLD.images)
       AND (NEW.created_at = OLD.created_at) THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'Only response and response_at may be updated on reviews';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;