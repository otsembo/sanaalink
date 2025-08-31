-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
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
