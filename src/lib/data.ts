// In-memory data store for the MVP
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  avatar?: string;
  type: 'customer' | 'provider' | 'artisan';
  isOnline: boolean;
  joinedDate: string;
}

export interface Service {
  id: string;
  providerId: string;
  category: string;
  title: string;
  description: string;
  services: string[];
  price: string;
  priceRange: { min: number; max: number };
  rating: number;
  reviews: number;
  location: string;
  available: string;
  images: string[];
  tags: string[];
  featured: boolean;
}

export interface Craft {
  id: string;
  artisanId: string;
  category: string;
  title: string;
  description: string;
  items: string[];
  price: string;
  priceRange: { min: number; max: number };
  rating: number;
  reviews: number;
  location: string;
  images: string[];
  tags: string[];
  featured: boolean;
  inStock: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  customerId: string;
  providerId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  totalAmount: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: Array<{
    craftId: string;
    quantity: number;
    price: number;
  }>;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: string;
  orderDate: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'booking_request' | 'order_inquiry';
}

// Dummy Users Data
export const users: User[] = [
  {
    id: '1',
    name: 'John Mwangi',
    email: 'john.mwangi@email.com',
    phone: '+254 712 345 678',
    location: 'Nairobi, Karen',
    type: 'provider',
    isOnline: true,
    joinedDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Sarah Kimani',
    email: 'sarah.kimani@email.com',
    phone: '+254 723 456 789',
    location: 'Kisumu Central',
    type: 'provider',
    isOnline: false,
    joinedDate: '2023-02-20',
  },
  {
    id: '3',
    name: 'Anne Wairimu',
    email: 'anne.wairimu@email.com',
    phone: '+254 734 567 890',
    location: 'Nairobi, Westlands',
    type: 'artisan',
    isOnline: true,
    joinedDate: '2023-03-10',
  },
  {
    id: '4',
    name: 'Peter Ochieng',
    email: 'peter.ochieng@email.com',
    phone: '+254 745 678 901',
    location: 'Mombasa, Nyali',
    type: 'provider',
    isOnline: true,
    joinedDate: '2023-01-25',
  },
  {
    id: '5',
    name: 'Grace Wanjiku',
    email: 'grace.wanjiku@email.com',
    phone: '+254 756 789 012',
    location: 'Nakuru Town',
    type: 'provider',
    isOnline: true,
    joinedDate: '2023-02-05',
  },
  {
    id: 'customer-1',
    name: 'David Kiplagat',
    email: 'david.kiplagat@email.com',
    phone: '+254 767 890 123',
    location: 'Nairobi, Kilimani',
    type: 'customer',
    isOnline: true,
    joinedDate: '2024-01-10',
  },
];

// Enhanced Services Data
export const services: Service[] = [
  {
    id: 'service-1',
    providerId: '1',
    category: 'Home Maintenance',
    title: 'Professional Plumbing & Electrical Services',
    description: 'Expert plumbing and electrical services for residential and commercial properties. 24/7 emergency services available.',
    services: ['Plumbing', 'Electrical', 'HVAC'],
    price: 'From KSh 1,500',
    priceRange: { min: 1500, max: 15000 },
    rating: 4.8,
    reviews: 127,
    location: 'Nairobi, Karen',
    available: 'Available today',
    images: ['/placeholder-service-1.jpg', '/placeholder-service-1-2.jpg'],
    tags: ['emergency', 'licensed', 'insured', 'experienced'],
    featured: true,
  },
  {
    id: 'service-2',
    providerId: '2',
    category: 'Construction',
    title: 'Quality Construction & Renovation',
    description: 'Professional construction services including masonry, carpentry, and welding. Quality guaranteed.',
    services: ['Masonry', 'Carpentry', 'Welding'],
    price: 'From KSh 2,000',
    priceRange: { min: 2000, max: 50000 },
    rating: 4.9,
    reviews: 89,
    location: 'Kisumu Central',
    available: 'Available tomorrow',
    images: ['/placeholder-service-2.jpg'],
    tags: ['construction', 'renovation', 'quality'],
    featured: false,
  },
  {
    id: 'service-3',
    providerId: '4',
    category: 'Automotive',
    title: 'Complete Auto Care Services',
    description: 'Full automotive services including mechanical repairs, car wash, and tire services. Modern equipment used.',
    services: ['Mechanics', 'Car Wash', 'Tire Repair'],
    price: 'From KSh 800',
    priceRange: { min: 800, max: 25000 },
    rating: 4.7,
    reviews: 156,
    location: 'Mombasa, Nyali',
    available: 'Available now',
    images: ['/placeholder-service-3.jpg'],
    tags: ['automotive', 'mechanical', 'car wash'],
    featured: true,
  },
  {
    id: 'service-4',
    providerId: '5',
    category: 'Property Care',
    title: 'Complete Property Management',
    description: 'Professional cleaning, gardening, and security services for residential and commercial properties.',
    services: ['Cleaning', 'Gardening', 'Security'],
    price: 'From KSh 1,200',
    priceRange: { min: 1200, max: 8000 },
    rating: 5.0,
    reviews: 203,
    location: 'Nakuru Town',
    available: 'Available today',
    images: ['/placeholder-service-4.jpg'],
    tags: ['cleaning', 'gardening', 'security', 'reliable'],
    featured: false,
  },
];

// Enhanced Crafts Data
export const crafts: Craft[] = [
  {
    id: 'craft-1',
    artisanId: '3',
    category: 'Art & Decor',
    title: 'Contemporary African Art Collection',
    description: 'Beautiful paintings, sculptures and wall art inspired by African culture and contemporary themes.',
    items: ['Paintings', 'Sculptures', 'Wall Art'],
    price: 'KSh 2,500 - KSh 15,000',
    priceRange: { min: 2500, max: 15000 },
    rating: 4.9,
    reviews: 78,
    location: 'Nairobi, Westlands',
    images: ['/placeholder-craft-1.jpg', '/placeholder-craft-1-2.jpg'],
    tags: ['art', 'decor', 'contemporary', 'african', 'unique'],
    featured: true,
    inStock: 25,
  },
  {
    id: 'craft-2',
    artisanId: '2',
    category: 'Fashion & Textiles',
    title: 'Authentic Maasai Fashion & Accessories',
    description: 'Traditional and modern Maasai-inspired clothing, jewelry, and accessories. Ethically sourced materials.',
    items: ['Kikoy', 'Maasai Jewelry', 'Bags'],
    price: 'KSh 800 - KSh 5,000',
    priceRange: { min: 800, max: 5000 },
    rating: 4.8,
    reviews: 134,
    location: 'Kajiado, Maasai Land',
    images: ['/placeholder-craft-2.jpg'],
    tags: ['maasai', 'traditional', 'fashion', 'accessories', 'authentic'],
    featured: false,
    inStock: 45,
  },
  {
    id: 'craft-3',
    artisanId: '3',
    category: 'Pottery & Ceramics',
    title: 'Handcrafted Ceramic Collection',
    description: 'Beautiful handmade pottery including vases, dishes, and decorative pots. Each piece is unique.',
    items: ['Vases', 'Dishes', 'Decorative Pots'],
    price: 'KSh 500 - KSh 8,000',
    priceRange: { min: 500, max: 8000 },
    rating: 5.0,
    reviews: 67,
    location: 'Kisumu, Kibos',
    images: ['/placeholder-craft-3.jpg'],
    tags: ['pottery', 'ceramics', 'handmade', 'unique', 'decorative'],
    featured: true,
    inStock: 30,
  },
];

// Sample Bookings
export const bookings: Booking[] = [
  {
    id: 'booking-1',
    serviceId: 'service-1',
    customerId: 'customer-1',
    providerId: '1',
    date: '2024-08-30',
    time: '10:00',
    status: 'confirmed',
    notes: 'Kitchen sink repair needed',
    totalAmount: 3500,
  },
];

// Sample Orders
export const orders: Order[] = [
  {
    id: 'order-1',
    customerId: 'customer-1',
    items: [
      { craftId: 'craft-1', quantity: 1, price: 5000 },
      { craftId: 'craft-3', quantity: 2, price: 1200 },
    ],
    status: 'confirmed',
    totalAmount: 7400,
    shippingAddress: 'Nairobi, Kilimani',
    orderDate: '2024-08-29',
  },
];

// Sample Messages
export const messages: Message[] = [
  {
    id: 'msg-1',
    fromId: 'customer-1',
    toId: '1',
    content: 'Hi, I need a plumber for my kitchen sink. When are you available?',
    timestamp: '2024-08-29T10:30:00Z',
    read: true,
    type: 'text',
  },
  {
    id: 'msg-2',
    fromId: '1',
    toId: 'customer-1',
    content: 'Hello! I can come today at 2 PM. Would that work for you?',
    timestamp: '2024-08-29T11:00:00Z',
    read: false,
    type: 'text',
  },
];