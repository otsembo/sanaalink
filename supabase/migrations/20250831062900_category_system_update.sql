-- Create a provider_categories junction table to support multiple categories per provider
CREATE TABLE public.provider_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  sub_category_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, category_id, sub_category_id)
);

-- Remove the category and sub_category columns from providers table
ALTER TABLE public.providers DROP COLUMN category;
ALTER TABLE public.providers DROP COLUMN sub_category;

-- Enable RLS
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for provider_categories
CREATE POLICY "Public read access"
ON public.provider_categories
FOR SELECT
USING (true);

CREATE POLICY "Providers can insert their own categories"
ON public.provider_categories
FOR INSERT
TO authenticated
WITH CHECK (
  provider_id IN (
    SELECT id FROM public.providers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Providers can update their own categories"
ON public.provider_categories
FOR UPDATE
TO authenticated
USING (
  provider_id IN (
    SELECT id FROM public.providers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Providers can delete their own categories"
ON public.provider_categories
FOR DELETE
TO authenticated
USING (
  provider_id IN (
    SELECT id FROM public.providers WHERE user_id = auth.uid()
  )
);
