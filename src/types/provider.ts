import type { Database } from '@/integrations/supabase/types';

export type DatabaseProvider = Database['public']['Tables']['providers']['Row'];

export interface Provider {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  business_name: string;
  category: string;
  sub_category: string | null;
  location: string;
  bio: string;
  profile_image: string | null;
  portfolio_images: string[];
  preferred_contact: 'email' | 'phone' | 'whatsapp';
  is_verified: boolean;
  domain_name: string | null;
  domain_verification_token: string | null;
  created_at: string;
  updated_at: string | null;
  average_rating: number;
  total_reviews: number;
}

export interface Service {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  price: number;
  duration?: number;
  category: string;
  images?: string[];
  availability: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  provider_id: string;
  customer_id: string;
  product_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  quantity: number;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  shipping_address: string;
  tracking_number?: string;
  notes?: string;
}

export interface DomainConfig {
  id: string;
  provider_id: string;
  domain_name: string;
  is_verified: boolean;
  verification_token?: string;
  created_at: string;
  updated_at?: string;
  expires_at?: string;
}

export interface AvailabilitySettings {
  id: string;
  provider_id: string;
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  created_at: string;
  customer_id: string;
  provider_id: string;
  service_id?: string;
  product_id?: string;
  rating: number;
  comment: string;
  images?: string[];
  response?: string;
  response_at?: string;
}

export interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  provider_id: string;
  customer_id: string;
  service_id: string;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  notes?: string;
}