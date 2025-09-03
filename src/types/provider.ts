import type { Database } from '@/integrations/supabase/types';

export type DatabaseProvider = Database['public']['Tables']['providers']['Row'];

export interface Provider extends DatabaseProvider {
  portfolio_images?: string[];
  preferred_contact: 'email' | 'phone' | 'whatsapp';
  average_rating?: number;
  total_reviews?: number;
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
  availability: string | null;
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
  booking_date: string; // Combined date and time
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  notes: string;
}

export interface Order {
  id: string;
  provider_id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  delivery_address: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  provider_id: string;
  customer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface AvailabilitySchedule {
  id: string;
  provider_id: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  is_available: boolean;
}
