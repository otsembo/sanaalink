import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { Loader2, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { initiateSTKPush } from '@/integrations/supabase/mpesa';
import type { Product, Provider } from '@/types/provider';

interface ProductOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  provider: Provider;
}

export default function ProductOrderDialog({ isOpen, onClose, product, provider }: ProductOrderDialogProps) {
  const { state } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const totalAmount = product.price * quantity;

  const handleOrder = async () => {
    if (!state.currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to place an order.",
        variant: "destructive",
      });
      return;
    }

    if (!phone || !shippingAddress) {
      toast({
        title: "Missing Information",
        description: "Please provide your phone number and shipping address.",
        variant: "destructive",
      });
      return;
    }

    if (quantity > product.stock_quantity) {
      toast({
        title: "Insufficient Stock",
        description: "Not enough items in stock.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Create a new order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: state.currentUser.id,
          provider_id: provider.id,
          product_id: product.id,
          quantity,
          status: 'pending',
          payment_status: 'pending',
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) {
        toast({
          title: "Order Error",
          description: "Failed to create order. Please try again.",
          variant: "destructive",
        });
        throw orderError;
      }

      // Create a payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: orderData.id, // Using order id as booking_id for payments table compatibility
          amount: totalAmount,
          status: 'pending',
          provider_id: provider.id,
          customer_id: state.currentUser.id,
          payment_method: 'mpesa',
          transaction_ref: `ORDER-${orderData.id}-${Date.now()}`,
        })
        .select()
        .single();

      if (paymentError) {
        // Delete the order if payment record creation fails
        await supabase
          .from('orders')
          .delete()
          .eq('id', orderData.id);
        
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
        amount: totalAmount,
        reference: paymentData.transaction_ref,
      });

      if (response.ResponseCode === '0') {
        // Subscribe to real-time payment updates
        const paymentChannel = supabase
          .channel('payment-status-order')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'payments',
              filter: `transaction_ref=eq.${paymentData.transaction_ref}`,
            },
            async (payload) => {
              const payment = payload.new as {
                id: string;
                status: 'pending' | 'completed' | 'failed';
                transaction_ref: string | null;
              };
              
              if (payment.status === 'completed') {
                // Update order payment status and reduce stock
                const { error: updateError } = await supabase
                  .from('orders')
                  .update({ payment_status: 'completed', status: 'confirmed' })
                  .eq('id', orderData.id);

                if (updateError) {
                  console.error('Failed to update order status:', updateError);
                } else {
                  // Reduce product stock
                  await supabase
                    .from('products')
                    .update({ 
                      stock_quantity: product.stock_quantity - quantity 
                    })
                    .eq('id', product.id);

                  toast({
                    title: "Payment Successful",
                    description: "Your order has been confirmed!",
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
        
      } else {
        throw new Error(response.ResponseDescription);
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "Order Failed",
        description: "Failed to process your order. Please try again.",
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
          <DialogTitle>Order Product</DialogTitle>
          <DialogDescription>
            Complete your order for {product.title} from {provider.business_name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 items-center gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Available: {product.stock_quantity} items
            </p>
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

          <div className="grid grid-cols-1 items-center gap-2">
            <Label htmlFor="address">Shipping Address</Label>
            <Textarea
              id="address"
              placeholder="Enter your full shipping address..."
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 items-center gap-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or requests..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Separator className="my-2" />

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unit Price</span>
              <span>{new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
              }).format(product.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>{new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
              }).format(totalAmount)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleOrder} disabled={loading || !phone || !shippingAddress}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay & Order'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}