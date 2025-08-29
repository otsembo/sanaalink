import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const crafts = [
  {
    id: 1,
    category: 'Art & Decor',
    icon: Palette,
    items: ['Paintings', 'Sculptures', 'Wall Art'],
    artisan: 'Anne Wairimu',
    rating: 4.9,
    reviews: 78,
    location: 'Nairobi, Westlands',
    price: 'KSh 2,500 - KSh 15,000',
    featured: true,
    image: '/placeholder-craft-1.jpg'
  },
  {
    id: 2,
    category: 'Fashion & Textiles',
    icon: Shirt,
    items: ['Kikoy', 'Maasai Jewelry', 'Bags'],
    artisan: 'Samuel Kiprotich',
    rating: 4.8,
    reviews: 134,
    location: 'Kajiado, Maasai Land',
    price: 'KSh 800 - KSh 5,000',
    featured: false,
    image: '/placeholder-craft-2.jpg'
  },
  {
    id: 3,
    category: 'Pottery & Ceramics',
    icon: Coffee,
    items: ['Vases', 'Dishes', 'Decorative Pots'],
    artisan: 'Margaret Nyong\'o',
    rating: 5.0,
    reviews: 67,
    location: 'Kisumu, Kibos',
    price: 'KSh 500 - KSh 8,000',
    featured: true,
    image: '/placeholder-craft-3.jpg'
  },
  {
    id: 4,
    category: 'Jewelry',
    icon: Gem,
    items: ['Beadwork', 'Silver', 'Traditional'],
    artisan: 'Faith Chelimo',
    rating: 4.7,
    reviews: 156,
    location: 'Eldoret, Langas',
    price: 'KSh 300 - KSh 12,000',
    featured: false,
    image: '/placeholder-craft-4.jpg'
  },
  {
    id: 5,
    category: 'Woodwork',
    icon: TreePine,
    items: ['Carvings', 'Furniture', 'Utensils'],
    artisan: 'Joseph Muthomi',
    rating: 4.8,
    reviews: 92,
    location: 'Meru, Timau',
    price: 'KSh 1,000 - KSh 25,000',
    featured: true,
    image: '/placeholder-craft-5.jpg'
  },
  {
    id: 6,
    category: 'Food Products',
    icon: Utensils,
    items: ['Spices', 'Honey', 'Traditional Snacks'],
    artisan: 'Elizabeth Wambui',
    rating: 4.9,
    reviews: 188,
    location: 'Nyeri, Karatina',
    price: 'KSh 200 - KSh 3,000',
    featured: false,
    image: '/placeholder-craft-6.jpg'
  }
];

const CraftsSection = () => {
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
              const IconComponent = craft.icon;
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                        <h4 className="font-medium text-foreground">{craft.artisan}</h4>
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

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <p className="font-semibold text-foreground">{craft.price}</p>
                        <p className="text-xs text-muted-foreground">Price range</p>
                      </div>
                      <Button variant="accent" size="sm">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Shop
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