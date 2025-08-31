-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS providers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create availability_settings table
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

-- Create domain_configs table
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

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create profiles table for public user profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- Set up Row Level Security (RLS)
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Providers: Only authenticated users can create, only owner can update/delete
CREATE POLICY "Enable public read access to providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Enable authenticated create access to providers" ON providers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable owner update access to providers" ON providers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable owner delete access to providers" ON providers FOR DELETE USING (auth.uid() = user_id);

-- Services & Products: Public can view, only provider can manage
CREATE POLICY "Enable public read access to services" ON services FOR SELECT USING (true);
CREATE POLICY "Enable provider manage access to services" ON services USING (auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id));

CREATE POLICY "Enable public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Enable provider manage access to products" ON products USING (auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id));

-- Bookings & Orders: Customer and provider can view their own
CREATE POLICY "Enable customer/provider read access to bookings" ON bookings FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM providers WHERE id = provider_id
    UNION
    SELECT customer_id FROM bookings WHERE customer_id = auth.uid()
  )
);

CREATE POLICY "Enable customer/provider read access to orders" ON orders FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM providers WHERE id = provider_id
    UNION
    SELECT customer_id FROM orders WHERE customer_id = auth.uid()
  )
);

-- Reviews: Public can read, authenticated users can create
CREATE POLICY "Enable public read access to reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Enable authenticated create access to reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Enable owner response access to reviews" ON reviews FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id)
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id) AND
  (OLD.response IS NULL OR OLD.response = response) -- Only allow updating response fields
);

-- Profiles: Public can read, user can manage their own
CREATE POLICY "Enable public read access to profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable user manage access to profiles" ON profiles USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_products_provider_id ON products(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
