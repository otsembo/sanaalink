import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
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
  ShoppingCart
} from 'lucide-react';

const craftIcons: { [key: string]: any } = {
  'Art & Decor': Palette,
  'Fashion & Textiles': Shirt,
  'Pottery & Ceramics': Coffee,
  'Jewelry': Gem,
  'Woodwork': TreePine,
  'Food Products': Utensils,
};

const CraftsSection = () => {
  const { getFilteredCrafts, getUserById, addToCart, state, getCartItemCount } = useApp();
  const crafts = getFilteredCrafts();

  const handleAddToCart = (craftId: string) => {
    if (!state.currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    addToCart(craftId, 1);
    toast({
      title: "Added to Cart",
      description: "Item has been added to your cart.",
    });
  };

  const handleToggleFavorite = (craftId: string) => {
    if (!state.currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to save favorites.",
        variant: "destructive",
      });
      return;
    }

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

          {/* Crafts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {crafts.map((craft) => {
              const IconComponent = craftIcons[craft.category] || Palette;
              const artisan = getUserById(craft.artisanId);
              
              return (
                <Card 
                  key={craft.id} 
                  className="group cursor-pointer transition-all duration-300 hover:shadow-card hover:scale-105 bg-card-gradient border-border/50 relative overflow-hidden"
                >
                  {craft.featured && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="default" className="bg-accent text-accent-foreground">
                        Featured
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-accent" />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleToggleFavorite(craft.id)}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{craft.category}</CardTitle>
                    <CardDescription className="text-sm">
                      {craft.items.join(' • ')}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Artisan Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{artisan?.name}</h4>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{craft.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          <span className="font-medium">{craft.rating}</span>
                          <span className="text-muted-foreground">({craft.reviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock and Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <p className="font-semibold text-foreground">{craft.price}</p>
                        <p className="text-xs text-muted-foreground">{craft.inStock} in stock</p>
                      </div>
                      <Button 
                        variant="accent" 
                        size="sm"
                        onClick={() => handleAddToCart(craft.id)}
                        disabled={craft.inStock === 0}
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

          {/* CTA */}
          <div className="text-center mt-12">
            <Button variant="hero" size="lg">
              Explore All Crafts
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CraftsSection;