-- Create the domain_configs table
CREATE TABLE IF NOT EXISTS domain_configs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  domain_name text NOT NULL UNIQUE,
  is_verified boolean DEFAULT false,
  verification_token text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  expires_at timestamp with time zone
);

-- Create the availability_settings table
CREATE TABLE IF NOT EXISTS availability_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  weekday text NOT NULL CHECK (weekday IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  CONSTRAINT availability_settings_weekday_provider_unique UNIQUE (provider_id, weekday)
);

-- Update existing tables

-- Add payment_status to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed'));

-- Add verification_token to domain_names column to providers
ALTER TABLE providers ADD COLUMN IF NOT EXISTS domain_verification_token text;

-- Add payment_status to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed'));

-- Add stock_quantity to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0;
