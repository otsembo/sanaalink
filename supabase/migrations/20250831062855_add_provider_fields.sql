-- Add portfolio_images and preferred_contact fields to providers table
ALTER TABLE public.providers
  ADD COLUMN portfolio_images TEXT[],
  ADD COLUMN preferred_contact TEXT CHECK (preferred_contact IN ('email', 'phone', 'whatsapp'));
