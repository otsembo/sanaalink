import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import type { Provider, Product } from '@/types/provider';
import { 
  Palette, 
  Shirt, 
  Coffee, 
  Gem, 
  TreePine, 
  Utensils,
  Star,
  MapPin,
  Heart,
  ShoppingCart,
  Package
} from 'lucide-react';

const craftIcons: { [key: string]: typeof Palette } = {
  'Art & Decor': Palette,
  'Fashion & Textiles': Shirt,
  'Pottery & Ceramics': Coffee,
  'Jewelry': Gem,
  'Woodwork': TreePine,
  'Food Products': Utensils,
};

const CraftsSection = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<{ [key: string]: Provider }>({});
  
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

        // Get products from verified providers
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('provider_id', Object.keys(providersMap))
          .gt('stock_quantity', 0)
          .order('created_at', { ascending: false })
          .limit(6); // Limit to 6 products for the homepage section

        if (productsError) throw productsError;

        setProviders(providersMap);
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
  }, [toast]);

  const handleAddToCart = (productId: string) => {
    if (!state.currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement cart functionality
    toast({
      title: "Added to Cart",
      description: "Item has been added to your cart.",
    });
  };

  const handleToggleFavorite = (productId: string) => {
    if (!state.currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to save favorites.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement favorites functionality
    toast({
      title: "Added to Favorites",
      description: "Item saved to your favorites list.",
    });
  };

  return (
    <section id="crafts" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Authentic Crafts & Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover unique handmade items from talented Kenyan artisans. 
              Each piece tells a story and supports local communities.
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            // Loading state with skeletons
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Card key={n} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <Skeleton className="h-6 w-24 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No Products Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                There are no products available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const provider = providers[product.provider_id];
                const IconComponent = craftIcons[product.category] || Palette;
                
                return (
                  <Card 
                    key={product.id} 
                    className="group cursor-pointer transition-all duration-300 hover:shadow-card hover:scale-105 bg-card-gradient border-border/50 relative overflow-hidden"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                          <IconComponent className="h-6 w-6 text-accent" />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleToggleFavorite(product.id)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg line-clamp-1">{product.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {product.description}
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

                      {/* Stock and Price */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div>
                          <p className="font-semibold text-foreground">
                            {new Intl.NumberFormat('en-KE', {
                              style: 'currency',
                              currency: 'KES',
                            }).format(product.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">{product.stock_quantity} in stock</p>
                        </div>
                        <Button 
                          variant="accent" 
                          size="sm"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={product.stock_quantity === 0}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <Button variant="hero" size="lg" onClick={() => navigate('/marketplace')}>
              Explore All Products
            </Button>
          </div>
        </div>
        </div>
    </section>
  );
};

export default CraftsSection;