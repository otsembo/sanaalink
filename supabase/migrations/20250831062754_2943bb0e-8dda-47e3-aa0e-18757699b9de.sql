-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create providers table
CREATE TABLE public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  location TEXT NOT NULL,
  bio TEXT,
  profile_image TEXT,
  domain_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER, -- Duration in minutes
  availability TEXT,
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  images TEXT[], -- Array of image URLs
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for providers
CREATE POLICY "Everyone can view providers" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Users can update their own provider profile" ON public.providers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own provider profile" ON public.providers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Everyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Providers can manage their own services" ON public.services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.providers WHERE providers.id = services.provider_id AND providers.user_id = auth.uid())
);

-- RLS Policies for products
CREATE POLICY "Everyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Providers can manage their own products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.providers WHERE providers.id = products.provider_id AND providers.user_id = auth.uid())
);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (
  auth.uid() = customer_id OR 
  EXISTS (SELECT 1 FROM public.providers WHERE providers.id = bookings.provider_id AND providers.user_id = auth.uid())
);
CREATE POLICY "Customers can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Providers can update their bookings" ON public.bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.providers WHERE providers.id = bookings.provider_id AND providers.user_id = auth.uid())
);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
  auth.uid() = customer_id OR 
  EXISTS (SELECT 1 FROM public.providers WHERE providers.id = orders.provider_id AND providers.user_id = auth.uid())
);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Providers can update their orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.providers WHERE providers.id = orders.provider_id AND providers.user_id = auth.uid())
);

-- RLS Policies for reviews
CREATE POLICY "Everyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = customer_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();