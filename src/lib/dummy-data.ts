// Sample services data
export const dummyServices = [
  {
    id: 'service-1',
    category: 'Home Maintenance',
    services: ['Plumbing', 'Electrical', 'General Repair'],
    location: 'Westlands, Nairobi',
    providerId: 'provider-1',
    price: 'KES 1,000/hr',
    available: '24/7',
    rating: 4.8,
    reviews: 156
  },
  {
    id: 'service-2',
    category: 'Construction',
    services: ['Masonry', 'Carpentry', 'Painting'],
    location: 'Karen, Nairobi',
    providerId: 'provider-2',
    price: 'KES 2,500/day',
    available: 'Mon-Sat',
    rating: 4.6,
    reviews: 89
  },
  {
    id: 'service-3',
    category: 'Automotive',
    services: ['Car Repair', 'Tire Service', 'Car Wash'],
    location: 'Kilimani, Nairobi',
    providerId: 'provider-3',
    price: 'From KES 1,500',
    available: 'Mon-Sun',
    rating: 4.9,
    reviews: 203
  }
];

// Sample crafts data
export const dummyCrafts = [
  {
    id: 'craft-1',
    title: 'Handwoven Basket',
    category: 'Art & Decor',
    description: 'Beautiful handwoven basket made from locally sourced materials',
    providerId: 'provider-4',
    location: 'Kikuyu, Kiambu',
    price: 'KES 2,500',
    inStock: 5,
    rating: 4.7,
    reviews: 45
  },
  {
    id: 'craft-2',
    title: 'Traditional Jewelry Set',
    category: 'Jewelry',
    description: 'Handcrafted Maasai beaded necklace and earrings set',
    providerId: 'provider-5',
    location: 'Ongata Rongai, Kajiado',
    price: 'KES 3,500',
    inStock: 3,
    rating: 4.9,
    reviews: 78
  },
  {
    id: 'craft-3',
    title: 'Carved Wooden Figurine',
    category: 'Woodwork',
    description: 'Hand-carved African wildlife wooden sculpture',
    providerId: 'provider-6',
    location: 'Diani, Mombasa',
    price: 'KES 4,500',
    inStock: 2,
    rating: 5.0,
    reviews: 32
  }
];

// Sample provider data
export const dummyProviders = {
  'provider-1': {
    id: 'provider-1',
    name: 'John Kamau',
    rating: 4.8,
    verified: true
  },
  'provider-2': {
    id: 'provider-2',
    name: 'Alice Wanjiku',
    rating: 4.6,
    verified: true
  },
  'provider-3': {
    id: 'provider-3',
    name: 'David Omondi',
    rating: 4.9,
    verified: true
  },
  'provider-4': {
    id: 'provider-4',
    name: 'Sarah Muthoni',
    rating: 4.7,
    verified: true
  },
  'provider-5': {
    id: 'provider-5',
    name: 'Daniel Kiprop',
    rating: 4.9,
    verified: true
  },
  'provider-6': {
    id: 'provider-6',
    name: 'Mary Akinyi',
    rating: 5.0,
    verified: true
  }
};
