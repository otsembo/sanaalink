import { useEffect, useState } from 'react';
import { Provider, Booking, Order, Review } from '@/types/provider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  ShoppingBag,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  totalOrders: number;
  averageRating: number;
  recentBookings: Booking[];
  recentOrders: Order[];
  recentReviews: Review[];
  pendingBookings: number;
  pendingOrders: number;
}

interface ProviderOverviewProps {
  provider: Provider;
}

export default function ProviderOverview({ provider }: ProviderOverviewProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalOrders: 0,
    averageRating: 0,
    recentBookings: [],
    recentOrders: [],
    recentReviews: [],
    pendingBookings: 0,
    pendingOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total bookings and orders
        const [
          { count: totalBookings },
          { count: totalOrders },
          { data: reviewsData },
          { data: recentBookings },
          { data: recentOrders },
          { data: recentReviews },
          { count: pendingBookings },
          { count: pendingOrders },
        ] = await Promise.all([
          supabase
            .from('bookings')
            .select('*', { count: 'exact' })
            .eq('provider_id', provider.id),
          supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .eq('provider_id', provider.id),
          supabase
            .from('reviews')
            .select('rating')
            .eq('provider_id', provider.id),
          supabase
            .from('bookings')
            .select('*')
            .eq('provider_id', provider.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('orders')
            .select('*')
            .eq('provider_id', provider.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('reviews')
            .select('*')
            .eq('provider_id', provider.id)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('bookings')
            .select('*', { count: 'exact' })
            .eq('provider_id', provider.id)
            .eq('status', 'pending'),
          supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .eq('provider_id', provider.id)
            .eq('status', 'pending'),
        ]);

        // Calculate average rating
        const averageRating =
          reviewsData?.reduce((acc, review) => acc + review.rating, 0) /
            (reviewsData?.length || 1) || 0;

        setStats({
          totalBookings: totalBookings || 0,
          totalOrders: totalOrders || 0,
          averageRating,
          recentBookings: (recentBookings || []) as Booking[],
          recentOrders: (recentOrders || []) as Order[],
          recentReviews: (recentReviews || []) as Review[],
          pendingBookings: pendingBookings || 0,
          pendingOrders: pendingOrders || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [provider.id]);

  return (
    <div className="space-y-6">
      {/* Profile Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
          {!provider.is_verified && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              Pending Verification
            </Badge>
          )}
          {provider.is_verified && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Verified Provider
            </Badge>
          )}
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-start gap-6 pt-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={provider.profile_image} />
              <AvatarFallback>{provider.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{provider.name}</h3>
              <p className="text-gray-500">{provider.business_name}</p>
              <p className="text-sm text-gray-400">{provider.category}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalBookings} total bookings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalOrders} total orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average from all reviews
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalBookings + stats.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {new Date(booking.booking_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {booking.status}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                  }).format(booking.total_amount)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {order.status}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                  }).format(order.total_amount)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentReviews.map((review) => (
              <div key={review.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
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
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
