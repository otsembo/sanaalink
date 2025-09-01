-- Migration: Add category column to services table

ALTER TABLE public.services
  ADD COLUMN category text;
