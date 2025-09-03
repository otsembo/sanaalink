import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Grid2X2, List, Package, Star, MapPin, ShoppingCart, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import ProductOrderDialog from '@/components/ProductOrderDialog';
import type { Provider, Product } from '@/types/provider';

const sortOptions = [
  { label: 'Latest', value: 'created_at:desc' },
  { label: 'Oldest', value: 'created_at:asc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
];

const categoryOptions = [
  'All Categories',
  'Art & Decor',
  'Fashion & Textiles',
  'Pottery & Ceramics',
  'Jewelry',
  'Woodwork',
  'Food Products',
];

const ProductsGallery = () => {
  const { state } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<{ [key: string]: Provider }>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('created_at:desc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch providers and products
  useEffect(() => {
    const fetchProducts = async () => {
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

        setProviders(providersMap);

        // Get products from verified providers
        const [field, order] = sortBy.split(':');
        let query = supabase
          .from('products')
          .select('*')
          .in('provider_id', Object.keys(providersMap))
          .gt('stock_quantity', 0);

        // Apply category filter
        if (category !== 'All Categories') {
          query = query.eq('category', category);
        }

        // Apply search if query exists
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Apply sorting
        const { data: productsData, error: productsError } = await query
          .order(field, { ascending: order === 'asc' });

        if (productsError) throw productsError;

        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast, category, searchQuery, sortBy]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
  };

  const handleOrderProduct = (product: Product) => {
    if (!state.currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to order products.",
        variant: "destructive",
      });
      return;
    }

    setSelectedProduct(product);
    setIsOrderDialogOpen(true);
  };

  const handleToggleFavorite = (productId: string) => {
    if (!products || !providers) {
      toast({
        title: 'Error',
        description: 'Unable to save to favorites. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Implement favorites functionality
    toast({
      title: 'Added to Favorites',
      description: 'Item saved to your favorites list.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
            <p className="text-muted-foreground mt-2">
              Discover unique handmade products from verified local artisans
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1 border rounded-md">
                <Button
                  variant={view === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setView('grid')}
                >
                  <Grid2X2 className="h-4 w-4" />
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

          {/* Active Filters */}
          {(searchQuery || category !== 'All Categories') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {category !== 'All Categories' && (
                <Badge variant="secondary" className="text-xs">
                  Category: {category}
                </Badge>
              )}
            </div>
          )}

          {/* Products Grid/List */}
          {loading ? (
            <div className={view === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <Card key={n} className="animate-pulse">
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
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No Products Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || category !== 'All Categories'
                  ? "No products match your search criteria. Try adjusting your filters or search terms."
                  : "There are no products available at the moment. Please check back later."}
              </p>
              {(searchQuery || category !== 'All Categories') && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setCategory('All Categories');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className={view === 'grid' 
              ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
            }>
              {products.map((product) => {
                const provider = providers[product.provider_id];
                return (
                  <Card 
                    key={product.id} 
                    className={`group transition-all duration-300 hover:shadow-card ${
                      view === 'grid' ? 'hover:scale-105' : ''
                    } bg-card-gradient border-border/50`}
                  >
                    <div className={view === 'list' ? "flex" : ""}>
                      <div className={view === 'list' ? "w-48 h-48 flex-shrink-0" : "h-48"}>
                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={product.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-lg font-semibold line-clamp-1">{product.title}</h3>
                              <Badge variant="outline" className="mt-1">
                                {product.category}
                              </Badge>
                            </div>
                            <span className="font-bold text-accent whitespace-nowrap">
                              {new Intl.NumberFormat('en-KE', {
                                style: 'currency',
                                currency: 'KES',
                              }).format(product.price)}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-foreground">{provider?.business_name}</h4>
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{provider?.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-sm">
                                <Star className="h-3 w-3 fill-accent text-accent" />
                                <span className="text-muted-foreground">({product.stock_quantity} in stock)</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2 pt-2 border-t border-border/50">
                          <Button
                            variant="accent"
                            className="flex-1"
                            onClick={() => handleOrderProduct(product)}
                            disabled={product.stock_quantity === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Order Now
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFavorite(product.id)}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </div>
                    </div>
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

export default ProductsGallery;
