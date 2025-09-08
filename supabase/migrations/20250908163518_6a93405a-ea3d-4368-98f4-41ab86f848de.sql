-- Fix public schema and table privileges for unauthenticated access to public data
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.providers TO anon, authenticated;
GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT SELECT ON TABLE public.services TO anon, authenticated;

-- Ensure payments table has proper RLS and privileges for client operations
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert and read their own payments
GRANT INSERT, SELECT ON TABLE public.payments TO authenticated;

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
USING (
  auth.uid() = customer_id
  OR auth.uid() IN (
    SELECT providers.user_id FROM public.providers WHERE providers.id = payments.provider_id
  )
);

CREATE POLICY "Users can create their own payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Performance: index to speed up service function updates by transaction_ref
CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON public.payments(transaction_ref);