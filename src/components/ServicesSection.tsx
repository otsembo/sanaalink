import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Service, Provider } from '@/types/provider';
import { 
  Wrench, 
  Zap, 
  Hammer, 
  PaintBucket, 
  Car, 
  Home, 
  Smartphone,
  Construction,
  Briefcase,
  UserCog,
  Brush,
  Star,
  MapPin,
  Clock,
  MessageCircle,
  PackageOpen
} from 'lucide-react';
import { BookingButton } from '@/components/ui/booking-button';

const serviceIcons: { [key: string]: typeof Wrench } = {
  'Home Maintenance': Wrench,
  'Construction': Construction,
  'Automotive': Car,
  'Property Care': Home,
  'Tech Support': Smartphone,
  'Painting': Brush,
  'Business': Briefcase,
  'Professional': UserCog,
};

const ServicesSection = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<{ [key: string]: Provider }>({});

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Get verified providers first
        const { data: providersData, error: providersError } = await supabase
          .from('providers')
          .select('*')
          .eq('is_verified', true);

        if (providersError) throw providersError;

        // Create providers lookup map
        const providersMap = providersData.reduce((acc, provider) => {
          acc[provider.id] = {
            ...provider,
            portfolio_images: [],
            preferred_contact: 'phone',
            average_rating: 0,
            total_reviews: 0
          };
          return acc;
        }, {} as { [key: string]: Provider });

        // Get active services from verified providers
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .in('provider_id', Object.keys(providersMap))
          .order('created_at', { ascending: false })
          .limit(6); // Show only 6 latest services

        if (servicesError) throw servicesError;

        // Map services to match our Service type
        const mappedServices: Service[] = servicesData.map(service => ({
          ...service,
          category: providers[service.provider_id]?.category || 'Professional'
        }));

        setProviders(providersMap);
        setServices(mappedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: 'Error',
          description: 'Failed to load services. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [toast]);


  const handleContactProvider = (providerId: string) => {
    if (!state.currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to contact providers.",
        variant: "destructive",
      });
      return;
    }

    const provider = providers[providerId];
    if (provider) {
      // TODO: Implement messaging functionality
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
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Card key={n} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-12 w-12 rounded-xl bg-muted" />
                      <div className="h-5 w-20 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                    <div className="h-4 w-full bg-muted rounded" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-5 w-32 bg-muted rounded mb-2" />
                        <div className="h-4 w-24 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="h-8 w-24 bg-muted rounded" />
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-muted rounded" />
                        <div className="h-8 w-20 bg-muted rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No Services Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                There are no services available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const provider = providers[service.provider_id];
                const IconComponent = serviceIcons[provider?.category || 'Professional'] || Wrench;
                
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
                          {service.availability || 'Available'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {/* Provider Info */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">{provider?.business_name}</h4>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{provider?.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div>
                          <p className="font-semibold text-foreground">
                            {new Intl.NumberFormat('en-KE', {
                              style: 'currency',
                              currency: 'KES',
                            }).format(service.price)}
                          </p>
                          {service.duration && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{service.duration} mins</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContactProvider(service.provider_id)}
                          >
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                          <BookingButton 
                            service={service}
                            provider={provider}
                            variant="accent" 
                            size="sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

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