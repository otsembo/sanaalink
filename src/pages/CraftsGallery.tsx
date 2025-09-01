import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, Grid, List, Filter, Star, MapPin, ShoppingCart, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dummyCrafts, dummyProviders } from '@/lib/dummy-data';

interface CraftProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  provider: {
    name: string;
    location: string;
    profile_image: string | null;
  };
  category: string;
  created_at: string;
}

const sortOptions = [
  { label: 'Latest', value: 'created_at:desc' },
  { label: 'Oldest', value: 'created_at:asc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
];

const CraftsGallery = () => {
  const [products, setProducts] = useState<CraftProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at:desc');
  const { toast } = useToast();

  const fetchProducts = async (query = '', sort = 'created_at:desc') => {
    try {
      setLoading(true);
      const [field, order] = sort.split(':');
      
      let query_builder = supabase
        .from('products')
        .select(`
          *,
          provider:providers(name, location, profile_image)
        `)
        .eq('category', 'craft');

      // Apply search if query exists
      if (query) {
        query_builder = query_builder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Apply sorting
      query_builder = query_builder.order(field, { ascending: order === 'asc' });

      const { data, error } = await query_builder;

      if (error) throw error;

      setProducts(data as CraftProduct[]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch products. Please try again.',
        variant: 'destructive',
      });
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchQuery, sortBy);
  }, [searchQuery, sortBy]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">All Crafts</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search crafts..."
              className="pl-10 bg-card text-foreground border-border"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {/* Sort */}
          <Select value={sortBy} onValueChange={handleSort}>
            <SelectTrigger className="w-[160px] bg-card text-foreground border-border">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-popover text-foreground">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-accent/20">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* View Toggle */}
          <div className="flex gap-1 border rounded-md">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-card border-border">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className={view === 'grid' 
          ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "space-y-4"
        }>
          {(products.length > 0 ? products : dummyCrafts.map(craft => ({
            ...craft,
            images: ["/placeholder.svg"],
            provider: dummyProviders[craft.providerId] ? {
              name: dummyProviders[craft.providerId].name,
              location: craft.location,
              profile_image: null
            } : { name: "Unknown", location: craft.location, profile_image: null }
          }))).map((product) => (
            <Card key={product.id} className={`bg-card border-border ${view === 'list' ? "flex" : ""}`}>
              <div className={view === 'list' ? "w-48 h-48 flex-shrink-0" : "h-48"}>
                <img
                  src={product.images[0] || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-start text-lg md:text-xl font-bold text-foreground">
                    <span>{product.title}</span>
                    <span className="font-bold text-accent">KSh {product.price?.toLocaleString?.() || product.price}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{product.provider.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-xs text-muted-foreground">4.8</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={product.provider.profile_image || '/placeholder.svg'}
                      alt={product.provider.name}
                      className="h-8 w-8 rounded-full border border-muted"
                    />
                    <span className="text-sm font-medium text-foreground">{product.provider.name}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="accent" className="flex-1 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4 text-accent" />
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No crafts found</h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default CraftsGallery;
