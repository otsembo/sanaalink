import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Grid2X2, List, MapPin, MessageCircle, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { dummyServices, dummyProviders } from '@/lib/dummy-data';

const ServicesGallery = () => {
  const { getFilteredServices, getUserById, state } = useApp();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('');
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

  const sortServices = (services: any[]) => {
    switch (sortBy) {
      case 'price-asc':
        return [...services].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...services].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...services].sort((a, b) => b.rating - a.rating);
      default:
        return services;
    }
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
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${provider.name}.`,
      });
    }
  };

  const sortedServices = sortServices(services);

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
                value={state.searchQuery}
                onChange={(e) => state.dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
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
          {state.searchQuery && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <Badge variant="secondary" className="text-xs">
                <Search className="h-3 w-3 mr-1" />
                "{state.searchQuery}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-0 ml-1"
                  onClick={() => state.dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}

          {/* Services Grid/List */}
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {sortServices(services).map((service) => {
              const provider = getProvider(service.providerId);
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
                        {service.available}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="font-medium">{service.rating}</span>
                        <span className="text-muted-foreground">({service.reviews})</span>
                      </div>
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
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <p className="font-semibold text-foreground">{service.price}</p>
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
        </div>
      </div>
    </div>
  );
};

export default ServicesGallery;
