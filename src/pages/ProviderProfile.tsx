import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Star, 
  Clock, 
  ShoppingCart,
  ArrowLeft,
  Calendar,
  Verified
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  business_name: string;
  category: string;
  sub_category?: string;
  location: string;
  bio?: string;
  profile_image?: string;
  is_verified: boolean;
  created_at: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration?: number;
  images?: string[];
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  images?: string[];
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles: {
    name: string;
  };
}

const ProviderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProviderData();
  }, [id]);

  const fetchProviderData = async () => {
    try {
      // Fetch provider details
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();

      if (providerError) throw providerError;
      setProvider(providerData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', id);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('provider_id', id);

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch reviews with customer names
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          customer_id
        `)
        .eq('provider_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      
      // Fetch customer names separately
      const reviewsWithNames = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', review.customer_id)
            .single();
          
          return {
            ...review,
            profiles: { name: profile?.name || 'Anonymous' }
          };
        })
      );
      
      setReviews(reviewsWithNames);

    } catch (error: any) {
      toast({
        title: 'Error loading provider',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleContact = (method: 'phone' | 'whatsapp' | 'email') => {
    if (!provider) return;

    switch (method) {
      case 'phone':
        window.open(`tel:${provider.phone}`);
        break;
      case 'whatsapp':
        const whatsappNumber = provider.whatsapp || provider.phone;
        window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`);
        break;
      case 'email':
        window.open(`mailto:${provider.email}`);
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Provider Not Found</CardTitle>
            <CardDescription>The requested provider could not be found.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <div className="min-h-screen bg-gradient-to-br from-kenya-sunset/10 to-kenya-earth/10">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Provider Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={provider.profile_image} />
                    <AvatarFallback className="text-lg bg-kenya-sunset text-white">
                      {provider.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <h1 className="text-2xl font-bold text-kenya-earth">{provider.name}</h1>
                      {provider.is_verified && (
                        <Verified className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-lg text-kenya-sunset font-medium">{provider.business_name}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="secondary">{provider.category}</Badge>
                    {provider.sub_category && (
                      <Badge variant="outline">{provider.sub_category}</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{averageRating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{reviews.length} reviews</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.location}</span>
                    </div>
                  </div>

                  {provider.bio && (
                    <div className="text-left">
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{provider.bio}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleContact('phone')}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call {provider.phone}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleContact('whatsapp')}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleContact('email')}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Services and Products */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services */}
            {services.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-kenya-earth mb-6">Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="font-semibold text-kenya-sunset">
                              KSh {service.price.toLocaleString()}
                            </p>
                            {service.duration && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="mr-1 h-3 w-3" />
                                {service.duration} minutes
                              </div>
                            )}
                          </div>
                          <Button size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Service
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {products.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-kenya-earth mb-6">Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{product.title}</CardTitle>
                        <CardDescription>{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="font-semibold text-kenya-sunset">
                              KSh {product.price.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {product.stock_quantity} in stock
                            </p>
                          </div>
                          <Button size="sm" disabled={product.stock_quantity === 0}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-kenya-earth mb-6">Customer Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {review.profiles?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.profiles?.name || 'Anonymous'}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-600 text-sm">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;