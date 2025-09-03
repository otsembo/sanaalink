-- Add RLS policies for availability_settings table
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for availability_settings
CREATE POLICY "Providers can manage their own availability settings" 
ON availability_settings 
FOR ALL 
USING (
  provider_id IN (
    SELECT id FROM providers WHERE user_id = auth.uid()
  )
);

-- Create policy for public to view availability (needed for booking system)
CREATE POLICY "Public can view availability for verified providers" 
ON availability_settings 
FOR SELECT 
USING (
  provider_id IN (
    SELECT id FROM providers WHERE is_verified = true
  )
);

-- Fix orders table to include payment_status if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        ALTER TABLE orders ADD COLUMN payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]));
    END IF;
END $$;

-- Fix orders table to use shipping_address instead of delivery_address if needed
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
        ALTER TABLE orders RENAME COLUMN delivery_address TO shipping_address;
    END IF;
END $$;