import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { Loader2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { initiateSTKPush } from '@/integrations/supabase/mpesa';
import type { Service, Provider } from '@/types/provider';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  provider: Provider;
}

export default function BookingDialog({ isOpen, onClose, service, provider }: BookingDialogProps) {
  const { state } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState<Date>();

  const handleBookService = async () => {
    if (!state.currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to book a service.",
        variant: "destructive",
      });
      return;
    }

    if (!date || !phone) {
      toast({
        title: "Missing Information",
        description: "Please select a date and provide your phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Create a new booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: state.currentUser.id,
          provider_id: provider.id,
          service_id: service.id,
          booking_date: date.toISOString(),
          status: 'pending',
          payment_status: 'pending',
          total_amount: service.price,
        })
        .select()
        .single();

      if (bookingError) {
        toast({
          title: "Booking Error",
          description: "Failed to create booking. Please try again.",
          variant: "destructive",
        });
        throw bookingError;
      }

      // Create a payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingData.id,
          amount: service.price,
          status: 'pending',
          provider_id: provider.id,
          customer_id: state.currentUser.id,
          payment_method: 'mpesa',
          transaction_ref: `${bookingData.id}-${Date.now()}`,
        })
        .select()
        .single();

      if (paymentError) {
        // Delete the booking if payment record creation fails
        await supabase
          .from('bookings')
          .delete()
          .eq('id', bookingData.id);
        
        toast({
          title: "Payment Error",
          description: "Failed to create payment record. Please try again.",
          variant: "destructive",
        });
        throw paymentError;
      }

      // Initiate STK Push
      const response = await initiateSTKPush({
        phone,
        amount: service.price,
        reference: paymentData.transaction_ref,
      });

      if (response.ResponseCode === '0') {
        // Subscribe to real-time payment updates
        const paymentChannel = supabase
          .channel('payment-status')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'payments',
              filter: `transaction_ref=eq.${paymentData.transaction_ref}`,
            },
            async (payload: RealtimePostgresChangesPayload<{
              id: string;
              status: 'pending' | 'completed' | 'failed';
              transaction_ref: string | null;
            }>) => {
              const payment = payload.new as {
                id: string;
                status: 'pending' | 'completed' | 'failed';
                transaction_ref: string | null;
              };
              
              if (payment.status === 'completed') {
                // Update booking payment status
                const { error: updateError } = await supabase
                  .from('bookings')
                  .update({ payment_status: 'completed' })
                  .eq('id', bookingData.id);

                if (updateError) {
                  console.error('Failed to update booking status:', updateError);
                } else {
                  toast({
                    title: "Payment Successful",
                    description: "Your booking has been confirmed!",
                  });
                  paymentChannel.unsubscribe();
                  onClose();
                }
              } else if (payment.status === 'failed') {
                toast({
                  title: "Payment Failed",
                  description: "Please try again or use a different payment method.",
                  variant: "destructive",
                });
                paymentChannel.unsubscribe();
              }
            }
          )
          .subscribe();

        toast({
          title: "Payment Initiated",
          description: "Please check your phone to complete the payment.",
        });
        onClose();

        // Listen for payment status updates
        const subscription = supabase
          .channel('payment-status')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'payments',
              filter: `id=eq.${paymentData.id}`,
            },
            async (payload) => {
              const payment = payload.new as { status: 'pending' | 'completed' | 'failed' };
              if (payment.status === 'completed') {
                toast({
                  title: "Payment Successful",
                  description: "Your booking has been confirmed.",
                });
                subscription.unsubscribe();
              } else if (payment.status === 'failed') {
                toast({
                  title: "Payment Failed",
                  description: "Please try again or contact support.",
                  variant: "destructive",
                });
                subscription.unsubscribe();
              }
            }
          )
          .subscribe();
      } else {
        throw new Error(response.ResponseDescription);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to process your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Service</DialogTitle>
          <DialogDescription>
            Complete your booking for {service.title} with {provider.business_name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 items-center gap-2">
            <Label htmlFor="date">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) =>
                    date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 items-center gap-2">
            <Label htmlFor="phone">Phone Number (M-Pesa)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 254712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Separator className="my-2" />

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Fee</span>
              <span>{new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
              }).format(service.price)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleBookService} disabled={loading || !date || !phone}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay & Book'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
