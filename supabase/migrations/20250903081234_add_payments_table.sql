-- Add payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  provider_id UUID NOT NULL REFERENCES public.providers(id),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  payment_method TEXT NOT NULL DEFAULT 'mpesa',
  transaction_id TEXT,
  transaction_ref TEXT
);
