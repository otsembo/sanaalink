import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Provider, Service, Booking } from '@/types/provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface BookingsProps {
  provider: Provider;
}

export default function Bookings({ provider }: BookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [services, setServices] = useState<Service[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', provider.id)
        .order('booking_date', { ascending: true });

      if (error) throw error;

      setBookings(data as Booking[] || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching bookings';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [provider.id, toast]);

  const fetchServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', provider.id);

      if (error) throw error;

      // Map database fields to Service interface
      const mappedServices = (data || []).map(item => ({
        id: item.id,
        provider_id: item.provider_id,
        title: item.title,
        description: item.description,
        price: item.price,
        duration: item.duration,
        category: item.category || provider.category,
        sub_category: item.sub_category,
        images: item.images,
        is_available: true,
        availability: 'unavailable',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setServices(mappedServices);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching services';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [provider.id, provider.category, toast]);

  // Define memoized fetch functions
  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, [fetchBookings, fetchServices]);

  const handleStatusUpdate = async (bookingId: string, status: Booking['status']) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ));

      toast({
        title: 'Booking updated',
        description: `Booking status has been updated to ${status}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error updating booking';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filterBookings = (status: 'upcoming' | 'past' | 'cancelled') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      bookingDate.setHours(0, 0, 0, 0);

      switch (status) {
        case 'upcoming':
          return bookingDate >= today && booking.status !== 'cancelled';
        case 'past':
          return bookingDate < today || booking.status === 'completed';
        case 'cancelled':
          return booking.status === 'cancelled';
        default:
          return false;
      }
    });
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.title : 'Unknown Service';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bookings</h2>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4">
            {filterBookings('upcoming').map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                      <CardTitle>{getServiceName(booking.service_id)}</CardTitle>
                    <CardDescription>
                      {format(new Date(booking.booking_date), 'PPP')} at {format(new Date(booking.booking_date), 'HH:mm')}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-semibold">
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                          }).format(booking.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <Badge variant={booking.payment_status === 'completed' ? 'default' : 'secondary'}>
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>

                    {booking.notes && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            disabled={isUpdating}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            disabled={isUpdating}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          disabled={isUpdating}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid gap-4">
            {filterBookings('past').map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{getServiceName(booking.service_id)}</CardTitle>
                    <CardDescription>
                      {format(new Date(booking.booking_date), 'PPP')}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-semibold">
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                          }).format(booking.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <Badge variant={booking.payment_status === 'completed' ? 'default' : 'secondary'}>
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>

                    {booking.notes && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <div className="grid gap-4">
            {filterBookings('cancelled').map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{getServiceName(booking.service_id)}</CardTitle>
                    <CardDescription>
                      {format(new Date(booking.booking_date), 'PPP')}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-semibold">
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                          }).format(booking.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <Badge variant={booking.payment_status === 'completed' ? 'default' : 'secondary'}>
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>

                    {booking.notes && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
