import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { dummyServices, dummyProviders } from '@/lib/dummy-data';
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
  Clock,
  MessageCircle
} from 'lucide-react';

const serviceIcons: { [key: string]: any } = {
  'Home Maintenance': Wrench,
  'Construction': Hammer,
  'Automotive': Car,
  'Property Care': Home,
  'Tech Services': Smartphone,
  'Painting': PaintBucket,
};

const ServicesSection = () => {
  const navigate = useNavigate();
  const { getFilteredServices, getUserById, sendMessage, state } = useApp();
  const actualServices = getFilteredServices();
  // Use dummy data if actual services are empty
  const services = actualServices.length > 0 ? actualServices : dummyServices;
  
  // If using dummy data, override getUserById
  const getProvider = (id: string) => {
    if (actualServices.length > 0) {
      return getUserById(id);
    }
    return dummyProviders[id];
  };

  const handleBookService = (serviceId: string) => {
    if (!state.currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to book a service.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Booking Request",
      description: "Service booking functionality will be added soon!",
    });
  };

  const handleContactProvider = (providerId: string) => {
    if (!state.currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to contact providers.",
        variant: "destructive",
      });
      return;
    }

    const provider = getUserById(providerId);
    if (provider) {
      sendMessage(providerId, `Hi ${provider.name}, I'm interested in your services. Could you please provide more details?`);
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${provider.name}.`,
      });
    }
  };

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
              const IconComponent = serviceIcons[service.category] || Wrench;
              const provider = getProvider(service.providerId);
              
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
                        <h4 className="font-medium text-foreground">{provider?.name}</h4>
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

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <p className="font-semibold text-foreground">{service.price}</p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Quick response</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleContactProvider(service.providerId)}
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="accent" 
                          size="sm"
                          onClick={() => handleBookService(service.id)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button variant="hero" size="lg" onClick={() => navigate('/services')}>
              View All Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;