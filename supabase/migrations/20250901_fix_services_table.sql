-- Migration: Fix services table schema for app compatibility

ALTER TABLE public.services
  ALTER COLUMN images TYPE text[] USING images::text[],
  ALTER COLUMN duration DROP NOT NULL,
  ALTER COLUMN availability DROP NOT NULL;

ALTER TABLE public.services
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();
