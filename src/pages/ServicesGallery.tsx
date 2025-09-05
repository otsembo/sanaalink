import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Grid2X2, List, MapPin, MessageCircle, Search, SlidersHorizontal, PackageOpen, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BookingButton } from '@/components/ui/booking-button';
import type { Provider, Service } from '@/types/provider';

const ServicesGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<{ [key: string]: Provider }>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch services and their providers
  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // Get verified providers first
      const { data: providersData, error: providersError } = await supabase
        .from('providers')
        .select('*')
        .eq('is_verified', true);

      if (providersError) throw providersError;

      // Create providers lookup map with default values
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

      // Get all services from verified providers
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .in('provider_id', Object.keys(providersMap))
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      // Map the services data to match our Service type
      const mappedServices: Service[] = servicesData.map(service => ({
        ...service,
        // Use the provider's category if service doesn't have one  
        category: providersMap[service.provider_id]?.category || 'Uncategorized',
        availability: typeof service.availability === 'string' ? service.availability : 'unavailable'
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

  useEffect(() => {
    fetchServices();
  }, []);

  const sortServices = (services: Service[]) => {
    switch (sortBy) {
      case 'price-asc':
        return [...services].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...services].sort((a, b) => b.price - a.price);
      default:
        return services;
    }
  };

  const handleContactProvider = (providerId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to contact providers.",
        variant: "destructive",
      });
      return;
    }

    const provider = providers[providerId];
    if (provider) {
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${provider.name}.`,
      });
    }
  };

  // Filter services based on search query
  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    providers[service.provider_id]?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedServices = sortServices(filteredServices);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Services</h1>
            <p className="text-muted-foreground mt-2">
              Browse and connect with skilled service providers in your area
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1 border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {searchQuery && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <Badge variant="secondary" className="text-xs">
                <Search className="h-3 w-3 mr-1" />
                "{searchQuery}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-0 ml-1"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}

          {/* Services Grid/List */}
          {loading ? (
            // Loading state with skeletons
            <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Card key={n} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-16 w-16 rounded-md" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Skeleton className="h-6 w-24" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedServices.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No Services Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery 
                  ? "No services match your search criteria. Try adjusting your filters or search terms."
                  : "There are no services available at the moment. Please check back later."}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {sortedServices.map((service) => {
              const provider = providers[service.provider_id];
              return (
                <Card
                  key={service.id}
                  className={`group transition-all duration-300 hover:shadow-card ${
                    viewMode === 'grid' ? 'hover:scale-105' : ''
                  } bg-card-gradient border-border/50`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {service.availability}
                      </Badge>
                      {service.images && service.images.length > 0 && (
                        <img
                          src={service.images[0]}
                          alt={service.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Provider Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{provider?.name}</h4>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{provider?.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <p className="font-semibold text-foreground">
                        {new Intl.NumberFormat('en-KE', {
                          style: 'currency',
                          currency: 'KES',
                        }).format(service.price)}
                      </p>
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
                          variant="default"
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
        </div>
      </div>
    </div>
  );
};

export default ServicesGallery;