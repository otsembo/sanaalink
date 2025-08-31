# Provider Registration Multi-Category Update

## Overview
This update adds support for providers to select multiple categories when registering, using a new `provider_categories` junction table.

## Migration Steps

1. Run the new database migration:
   ```sql
   -- Create a provider_categories junction table
   CREATE TABLE public.provider_categories (
     id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
     category_id TEXT NOT NULL,
     sub_category_id TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
     UNIQUE(provider_id, category_id, sub_category_id)
   );

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
   ```

2. The following files have been updated:
   - `supabase/migrations/20250831062900_category_system_update.sql` - New migration file
   - `src/pages/ProviderRegistration.tsx` - Updated form to handle multiple categories
   - `src/components/ui/CategoryFilter.tsx` - Category selection component

## Testing
1. Try registering as a provider:
   - Select different provider types (service/craft/both)
   - Select multiple categories
   - Verify categories are saved in the provider_categories table

2. View provider profile:
   - Verify selected categories are displayed correctly

## Notes
- The `category` and `sub_category` columns in the `providers` table will be removed in a future migration after migrating existing data
