import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Grid2X2, List, MapPin, Search, SlidersHorizontal, PackageOpen, X, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductOrderDialog from '@/components/ProductOrderDialog';
import type { Provider, Product } from '@/types/provider';

const ProductsGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<{ [key: string]: Provider }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Fetch products and their providers
  const fetchProducts = async () => {
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

      // Get all products from verified providers
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('provider_id', Object.keys(providersMap))
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Map the products data to match our Product type
      const mappedProducts: Product[] = productsData.map(product => ({
        ...product,
        // Use the provider's category if product doesn't have one  
        category: providersMap[product.provider_id]?.category || 'Uncategorized'
      }));

      setProviders(providersMap);
      setProducts(mappedProducts);
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const sortProducts = (products: Product[]) => {
    switch (sortBy) {
      case 'price-asc':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...products].sort((a, b) => b.price - a.price);
      default:
        return products;
    }
  };

  const handleOrderClick = (product: Product) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to order products.",
        variant: "destructive",
      });
      return;
    }

    const provider = providers[product.provider_id];
    if (provider) {
      setSelectedProduct(product);
      setSelectedProvider(provider);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    providers[product.provider_id]?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = sortProducts(filteredProducts);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Products</h1>
            <p className="text-muted-foreground mt-2">
              Browse and shop from skilled product creators in your area
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

          {/* Products Grid/List */}
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
          ) : sortedProducts.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No Products Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery 
                  ? "No products match your search criteria. Try adjusting your filters or search terms."
                  : "There are no products available at the moment. Please check back later."}
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
              {sortedProducts.map((product) => {
              const provider = providers[product.provider_id];
              return (
                <Card
                  key={product.id}
                  className={`group transition-all duration-300 hover:shadow-card ${
                    viewMode === 'grid' ? 'hover:scale-105' : ''
                  } bg-card-gradient border-border/50`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                      {product.images && product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </div>
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {product.description}
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

                    {/* Stock Info */}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock_quantity} units available
                      </p>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <p className="font-semibold text-foreground">
                        {new Intl.NumberFormat('en-KE', {
                          style: 'currency',
                          currency: 'KES',
                        }).format(product.price)}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleOrderClick(product)}
                          disabled={product.stock_quantity === 0}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          {product.stock_quantity > 0 ? 'Order Now' : 'Out of Stock'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}

          {/* Order Dialog */}
          {selectedProduct && selectedProvider && (
            <ProductOrderDialog
              product={selectedProduct}
              provider={selectedProvider}
              isOpen={!!selectedProduct}
              onClose={() => {
                setSelectedProduct(null);
                setSelectedProvider(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsGallery;