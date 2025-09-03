-- Enable UUID extension (pgcrypto is preferred on Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================
-- Tables
-- ======================

-- Providers
CREATE TABLE IF NOT EXISTS providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  business_name text NOT NULL,
  category text NOT NULL,
  sub_category text,
  location text NOT NULL,
  bio text NOT NULL,
  profile_image text,
  portfolio_images text[],
  preferred_contact text NOT NULL CHECK (preferred_contact IN ('email', 'phone', 'whatsapp')),
  is_verified boolean DEFAULT false,
  domain_name text UNIQUE,
  domain_verification_token text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  duration integer CHECK (duration > 0), -- in minutes
  category text NOT NULL,
  sub_category text,
  images text[],
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  category text NOT NULL,
  sub_category text,
  images text[],
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  booking_date timestamp with time zone NOT NULL,
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_status text NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed')),
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_status text NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed')),
  shipping_address text NOT NULL,
  tracking_number text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- Availability Settings
CREATE TABLE IF NOT EXISTS availability_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  weekday text NOT NULL CHECK (weekday IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  CONSTRAINT availability_settings_weekday_provider_unique UNIQUE (provider_id, weekday)
);

-- Domain Configs
CREATE TABLE IF NOT EXISTS domain_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  domain_name text NOT NULL UNIQUE,
  is_verified boolean DEFAULT false,
  verification_token text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  expires_at timestamp with time zone
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  images text[],
  response text,
  response_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  CONSTRAINT reviews_service_or_product_check CHECK (
    (service_id IS NOT NULL AND product_id IS NULL) OR
    (service_id IS NULL AND product_id IS NOT NULL)
  )
);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- ======================
-- Enable RLS
-- ======================
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ======================
-- Policies
-- ======================

-- Providers
CREATE POLICY "Enable public read access to providers"
  ON providers FOR SELECT USING (true);

CREATE POLICY "Enable authenticated create access to providers"
  ON providers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable owner update access to providers"
  ON providers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable owner delete access to providers"
  ON providers FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Services
CREATE POLICY "Enable public read access to services"
  ON services FOR SELECT USING (true);

CREATE POLICY "Enable provider manage access to services"
  ON services FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id));

-- Products
CREATE POLICY "Enable public read access to products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Enable provider manage access to products"
  ON products FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id));

-- Bookings
CREATE POLICY "Enable customer/provider read access to bookings"
  ON bookings FOR SELECT TO authenticated
  USING (
    auth.uid() = customer_id OR
    auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id)
  );

-- Orders
CREATE POLICY "Enable customer/provider read access to orders"
  ON orders FOR SELECT TO authenticated
  USING (
    auth.uid() = customer_id OR
    auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id)
  );

-- Reviews
CREATE POLICY "Enable public read access to reviews"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Enable authenticated create access to reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Enable provider update access to reviews"
  ON reviews FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id));

-- Profiles
CREATE POLICY "Enable public read access to profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Enable user manage access to profiles"
  ON profiles FOR ALL TO authenticated
  USING (auth.uid() = id);

-- ======================
-- Triggers
-- ======================

-- Reviews: Only allow providers to update response/response_at
CREATE OR REPLACE FUNCTION enforce_response_only()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_response_only ON reviews;
CREATE TRIGGER reviews_response_only
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION enforce_response_only();

-- ======================
-- Indexes
-- ======================
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_products_provider_id ON products(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
