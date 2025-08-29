import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Zap, 
  Hammer, 
  PaintBucket, 
  Car, 
  Home, 
  Smartphone, 
  Shield,
  Star,
  MapPin,
  Clock
} from 'lucide-react';

const services = [
  {
    id: 1,
    category: 'Home Maintenance',
    icon: Wrench,
    services: ['Plumbing', 'Electrical', 'HVAC'],
    provider: 'John Mwangi',
    rating: 4.8,
    reviews: 127,
    location: 'Nairobi, Karen',
    price: 'From KSh 1,500',
    available: 'Available today',
    image: '/placeholder-service-1.jpg'
  },
  {
    id: 2,
    category: 'Construction',
    icon: Hammer,
    services: ['Masonry', 'Carpentry', 'Welding'],
    provider: 'Sarah Kimani',
    rating: 4.9,
    reviews: 89,
    location: 'Kisumu Central',
    price: 'From KSh 2,000',
    available: 'Available tomorrow',
    image: '/placeholder-service-2.jpg'
  },
  {
    id: 3,
    category: 'Automotive',
    icon: Car,
    services: ['Mechanics', 'Car Wash', 'Tire Repair'],
    provider: 'Peter Ochieng',
    rating: 4.7,
    reviews: 156,
    location: 'Mombasa, Nyali',
    price: 'From KSh 800',
    available: 'Available now',
    image: '/placeholder-service-3.jpg'
  },
  {
    id: 4,
    category: 'Property Care',
    icon: Home,
    services: ['Cleaning', 'Gardening', 'Security'],
    provider: 'Grace Wanjiku',
    rating: 5.0,
    reviews: 203,
    location: 'Nakuru Town',
    price: 'From KSh 1,200',
    available: 'Available today',
    image: '/placeholder-service-4.jpg'
  },
  {
    id: 5,
    category: 'Tech Services',
    icon: Smartphone,
    services: ['Phone Repair', 'Computer Repair', 'IT Support'],
    provider: 'David Kiprop',
    rating: 4.6,
    reviews: 94,
    location: 'Eldoret Town',
    price: 'From KSh 500',
    available: 'Available now',
    image: '/placeholder-service-5.jpg'
  },
  {
    id: 6,
    category: 'Painting',
    icon: PaintBucket,
    services: ['Interior', 'Exterior', 'Commercial'],
    provider: 'Mary Njeri',
    rating: 4.8,
    reviews: 112,
    location: 'Thika Town',
    price: 'From KSh 3,000',
    available: 'Available tomorrow',
    image: '/placeholder-service-6.jpg'
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Professional Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with skilled professionals across Kenya. From home repairs to technical services, 
              find trusted experts in your area.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card 
                  key={service.id} 
                  className="group cursor-pointer transition-all duration-300 hover:shadow-card hover:scale-105 bg-card-gradient border-border/50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {service.available}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{service.category}</CardTitle>
                    <CardDescription className="text-sm">
                      {service.services.join(' • ')}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Provider Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{service.provider}</h4>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{service.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          <span className="font-medium">{service.rating}</span>
                          <span className="text-muted-foreground">({service.reviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <p className="font-semibold text-foreground">{service.price}</p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Quick response</span>
                        </div>
                      </div>
                      <Button variant="accent" size="sm">
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button variant="hero" size="lg">
              View All Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;