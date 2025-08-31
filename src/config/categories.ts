export interface Category {
  id: string;
  name: string;
  description: string;
  type: 'service' | 'craft';
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  description: string;
}

export const serviceCategories: Category[] = [
  {
    id: 'home-maintenance',
    name: 'Home Maintenance',
    description: 'Essential home maintenance and repair services',
    type: 'service',
    subCategories: [
      { id: 'plumbing', name: 'Plumbing', description: 'Water systems and fixture repairs' },
      { id: 'electrical', name: 'Electrical', description: 'Electrical system maintenance and installation' },
      { id: 'hvac', name: 'HVAC', description: 'Heating, ventilation, and air conditioning' },
      { id: 'general-repairs', name: 'General Repairs', description: 'General home repairs and maintenance' }
    ]
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Construction and major renovation services',
    type: 'service',
    subCategories: [
      { id: 'building', name: 'Building', description: 'New construction and additions' },
      { id: 'renovation', name: 'Renovation', description: 'Major home renovations' },
      { id: 'masonry', name: 'Masonry', description: 'Brick and stone work' }
    ]
  },
  {
    id: 'specialized-trades',
    name: 'Specialized Trades',
    description: 'Specialized construction and repair trades',
    type: 'service',
    subCategories: [
      { id: 'welding', name: 'Welding', description: 'Metal fabrication and welding' },
      { id: 'roofing', name: 'Roofing', description: 'Roof installation and repair' },
      { id: 'painting', name: 'Painting', description: 'Interior and exterior painting' }
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Vehicle maintenance and repair services',
    type: 'service',
    subCategories: [
      { id: 'mechanic', name: 'Mechanic', description: 'General vehicle repairs' },
      { id: 'bodywork', name: 'Bodywork', description: 'Vehicle body repairs and painting' },
      { id: 'detailing', name: 'Detailing', description: 'Vehicle cleaning and detailing' }
    ]
  },
  {
    id: 'property-care',
    name: 'Property Care',
    description: 'Property maintenance and landscaping',
    type: 'service',
    subCategories: [
      { id: 'landscaping', name: 'Landscaping', description: 'Garden and landscape design' },
      { id: 'cleaning', name: 'Cleaning', description: 'Property cleaning services' },
      { id: 'pest-control', name: 'Pest Control', description: 'Pest prevention and removal' }
    ]
  },
  {
    id: 'home-improvement',
    name: 'Home Improvement',
    description: 'Home enhancement and decoration services',
    type: 'service',
    subCategories: [
      { id: 'interior-design', name: 'Interior Design', description: 'Interior decoration and design' },
      { id: 'flooring', name: 'Flooring', description: 'Floor installation and repair' },
      { id: 'kitchen-bath', name: 'Kitchen & Bath', description: 'Kitchen and bathroom remodeling' }
    ]
  },
  {
    id: 'beauty-services',
    name: 'Beauty Services',
    description: 'Personal beauty and care services',
    type: 'service',
    subCategories: [
      { id: 'hair', name: 'Hair Styling', description: 'Hair cutting and styling' },
      { id: 'makeup', name: 'Makeup', description: 'Makeup application and consultation' },
      { id: 'nails', name: 'Nail Care', description: 'Manicure and pedicure services' }
    ]
  },
  {
    id: 'wellness-services',
    name: 'Wellness Services',
    description: 'Health and wellness services',
    type: 'service',
    subCategories: [
      { id: 'massage', name: 'Massage', description: 'Therapeutic massage services' },
      { id: 'spa', name: 'Spa Services', description: 'Spa treatments and therapy' },
      { id: 'nutrition', name: 'Nutrition', description: 'Nutrition consultation and planning' }
    ]
  },
  {
    id: 'fitness-services',
    name: 'Fitness Services',
    description: 'Personal fitness and training services',
    type: 'service',
    subCategories: [
      { id: 'personal-training', name: 'Personal Training', description: 'Individual fitness training' },
      { id: 'yoga', name: 'Yoga', description: 'Yoga instruction and classes' },
      { id: 'group-fitness', name: 'Group Fitness', description: 'Group exercise classes' }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Entertainment and event services',
    type: 'service',
    subCategories: [
      { id: 'dj', name: 'DJ Services', description: 'Music and DJ services' },
      { id: 'live-music', name: 'Live Music', description: 'Live music performance' },
      { id: 'mc', name: 'MC Services', description: 'Event hosting and MC services' }
    ]
  },
  {
    id: 'photography-video',
    name: 'Photography/Video',
    description: 'Photography and videography services',
    type: 'service',
    subCategories: [
      { id: 'photography', name: 'Photography', description: 'Professional photography' },
      { id: 'videography', name: 'Videography', description: 'Video production services' },
      { id: 'editing', name: 'Editing', description: 'Photo and video editing' }
    ]
  },
  {
    id: 'event-services',
    name: 'Event Services',
    description: 'Event planning and management services',
    type: 'service',
    subCategories: [
      { id: 'planning', name: 'Event Planning', description: 'Event planning and coordination' },
      { id: 'decor', name: 'Event Decor', description: 'Event decoration services' },
      { id: 'catering', name: 'Catering', description: 'Food and beverage services' }
    ]
  },
  {
    id: 'performance-arts',
    name: 'Performance Arts',
    description: 'Live performance and artistic services',
    type: 'service',
    subCategories: [
      { id: 'dance', name: 'Dance', description: 'Dance performance and instruction' },
      { id: 'theater', name: 'Theater', description: 'Theatrical performance' },
      { id: 'music', name: 'Music', description: 'Musical performance and instruction' }
    ]
  },
  {
    id: 'moving-services',
    name: 'Moving Services',
    description: 'Relocation and moving services',
    type: 'service',
    subCategories: [
      { id: 'residential', name: 'Residential Moving', description: 'Home moving services' },
      { id: 'commercial', name: 'Commercial Moving', description: 'Business moving services' },
      { id: 'packing', name: 'Packing Services', description: 'Professional packing and unpacking' }
    ]
  },
  {
    id: 'courier-services',
    name: 'Courier Services',
    description: 'Delivery and courier services',
    type: 'service',
    subCategories: [
      { id: 'local-delivery', name: 'Local Delivery', description: 'Same-day local delivery' },
      { id: 'express', name: 'Express Courier', description: 'Express delivery services' },
      { id: 'specialized', name: 'Specialized Delivery', description: 'Specialized item delivery' }
    ]
  },
  {
    id: 'driver-services',
    name: 'Driver Services',
    description: 'Professional driving services',
    type: 'service',
    subCategories: [
      { id: 'private-driver', name: 'Private Driver', description: 'Personal driver services' },
      { id: 'tour-driver', name: 'Tour Driver', description: 'Tourism and sightseeing drivers' },
      { id: 'special-events', name: 'Special Events', description: 'Event transportation services' }
    ]
  },
  {
    id: 'electronic-repair',
    name: 'Electronic Repair',
    description: 'Electronic device repair services',
    type: 'service',
    subCategories: [
      { id: 'phone-repair', name: 'Phone Repair', description: 'Mobile phone repairs' },
      { id: 'computer-repair', name: 'Computer Repair', description: 'Computer and laptop repairs' },
      { id: 'appliance-repair', name: 'Appliance Repair', description: 'Home appliance repairs' }
    ]
  }
];

export const craftCategories: Category[] = [
  {
    id: 'art-decor',
    name: 'Art & Decor',
    description: 'Decorative art and home decor items',
    type: 'craft',
    subCategories: [
      { id: 'paintings', name: 'Paintings', description: 'Original paintings and prints' },
      { id: 'wall-art', name: 'Wall Art', description: 'Decorative wall pieces' },
      { id: 'sculptures', name: 'Sculptures', description: 'Decorative sculptures' }
    ]
  },
  {
    id: 'fashion-textiles',
    name: 'Fashion & Textiles',
    description: 'Handmade clothing and textile items',
    type: 'craft',
    subCategories: [
      { id: 'clothing', name: 'Clothing', description: 'Handmade clothing' },
      { id: 'accessories', name: 'Accessories', description: 'Fashion accessories' },
      { id: 'textiles', name: 'Textiles', description: 'Handwoven textiles' }
    ]
  },
  {
    id: 'pottery-ceramics',
    name: 'Pottery & Ceramics',
    description: 'Handcrafted pottery and ceramic items',
    type: 'craft',
    subCategories: [
      { id: 'functional', name: 'Functional Pottery', description: 'Usable pottery items' },
      { id: 'decorative', name: 'Decorative Ceramics', description: 'Decorative ceramic pieces' },
      { id: 'sculptural', name: 'Sculptural Ceramics', description: 'Ceramic sculptures' }
    ]
  },
  {
    id: 'woodwork',
    name: 'Woodwork',
    description: 'Handcrafted wooden items',
    type: 'craft',
    subCategories: [
      { id: 'furniture', name: 'Furniture', description: 'Handcrafted furniture' },
      { id: 'decor', name: 'Decorative Items', description: 'Wooden decorative pieces' },
      { id: 'utensils', name: 'Utensils', description: 'Wooden kitchen items' }
    ]
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    description: 'Handcrafted jewelry pieces',
    type: 'craft',
    subCategories: [
      { id: 'metal', name: 'Metal Jewelry', description: 'Metal jewelry pieces' },
      { id: 'beadwork', name: 'Beadwork', description: 'Beaded jewelry' },
      { id: 'mixed-media', name: 'Mixed Media', description: 'Mixed material jewelry' }
    ]
  },
  {
    id: 'home-products',
    name: 'Home Products',
    description: 'Handmade items for the home',
    type: 'craft',
    subCategories: [
      { id: 'linens', name: 'Linens', description: 'Handmade home linens' },
      { id: 'kitchenware', name: 'Kitchenware', description: 'Handmade kitchen items' },
      { id: 'decor-items', name: 'Decor Items', description: 'Decorative home items' }
    ]
  },
  {
    id: 'musical-instruments',
    name: 'Musical Instruments',
    description: 'Handcrafted musical instruments',
    type: 'craft',
    subCategories: [
      { id: 'string', name: 'String Instruments', description: 'Handmade string instruments' },
      { id: 'percussion', name: 'Percussion', description: 'Handmade percussion instruments' },
      { id: 'wind', name: 'Wind Instruments', description: 'Handmade wind instruments' }
    ]
  },
  {
    id: 'stone-carving',
    name: 'Stone Carving',
    description: 'Hand-carved stone items',
    type: 'craft',
    subCategories: [
      { id: 'sculptures', name: 'Sculptures', description: 'Stone sculptures' },
      { id: 'architectural', name: 'Architectural', description: 'Architectural stone elements' },
      { id: 'decorative', name: 'Decorative', description: 'Decorative stone items' }
    ]
  },
  {
    id: 'fiber-arts',
    name: 'Fiber Arts',
    description: 'Handmade fiber art pieces',
    type: 'craft',
    subCategories: [
      { id: 'weaving', name: 'Weaving', description: 'Hand-woven items' },
      { id: 'knitting', name: 'Knitting', description: 'Knitted items' },
      { id: 'crochet', name: 'Crochet', description: 'Crocheted items' }
    ]
  },
  {
    id: 'cultural-items',
    name: 'Cultural Items',
    description: 'Traditional and cultural crafts',
    type: 'craft',
    subCategories: [
      { id: 'traditional', name: 'Traditional Crafts', description: 'Traditional handmade items' },
      { id: 'ceremonial', name: 'Ceremonial Items', description: 'Items for cultural ceremonies' },
      { id: 'artifacts', name: 'Cultural Artifacts', description: 'Cultural art pieces' }
    ]
  },
  {
    id: 'craft-supplies',
    name: 'Craft Supplies',
    description: 'Handmade craft materials',
    type: 'craft',
    subCategories: [
      { id: 'materials', name: 'Materials', description: 'Raw craft materials' },
      { id: 'tools', name: 'Tools', description: 'Handmade craft tools' },
      { id: 'kits', name: 'Craft Kits', description: 'DIY craft kits' }
    ]
  },
  {
    id: 'fine-art',
    name: 'Fine Art',
    description: 'Original fine art pieces',
    type: 'craft',
    subCategories: [
      { id: 'paintings', name: 'Paintings', description: 'Original paintings' },
      { id: 'drawings', name: 'Drawings', description: 'Original drawings' },
      { id: 'prints', name: 'Prints', description: 'Fine art prints' }
    ]
  },
  {
    id: 'leather-goods',
    name: 'Leather Goods',
    description: 'Handcrafted leather items',
    type: 'craft',
    subCategories: [
      { id: 'bags', name: 'Bags', description: 'Leather bags and accessories' },
      { id: 'footwear', name: 'Footwear', description: 'Handmade leather shoes' },
      { id: 'small-goods', name: 'Small Goods', description: 'Small leather items' }
    ]
  }
];
