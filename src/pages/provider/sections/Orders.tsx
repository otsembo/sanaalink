import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Provider, Product, Order } from '@/types/provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Package, Truck } from 'lucide-react';

interface OrdersProps {
  provider: Provider;
}

export default function Orders({ provider }: OrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [products, setProducts] = useState<Product[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data as Order[] || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching orders';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [provider.id, toast]);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('provider_id', provider.id);

      if (error) throw error;

      const mappedProducts = (data || []).map(item => ({
        id: item.id,
        provider_id: item.provider_id,
        title: item.title,
        description: item.description,
        price: item.price,
        stock_quantity: item.stock_quantity,
        category: provider.category,
        sub_category: item.sub_category,
        images: item.images,
        is_available: true,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setProducts(mappedProducts);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching products';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [provider.id, provider.category, toast]);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));

      toast({
        title: 'Order updated',
        description: `Order status has been updated to ${status}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error updating order';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filterOrders = (tab: 'pending' | 'processing' | 'completed' | 'cancelled') => {
    switch (tab) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'processing':
        return orders.filter(order => ['confirmed', 'shipped'].includes(order.status));
      case 'completed':
        return orders.filter(order => order.status === 'delivered');
      case 'cancelled':
        return orders.filter(order => order.status === 'cancelled');
      default:
        return [];
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.title : 'Unknown Product';
  };

  const getNextStatus = (currentStatus: Order['status']) => {
    switch (currentStatus) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'shipped';
      case 'shipped':
        return 'delivered';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders</h2>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {['pending', 'processing', 'completed', 'cancelled'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid gap-4">
              {filterOrders(tab as 'pending' | 'processing' | 'completed' | 'cancelled').map((order) => (
                <Card key={order.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>{getProductName(order.product_id)}</CardTitle>
                      <CardDescription>
                        Order #{order.id.slice(-6)} • {format(new Date(order.created_at), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-semibold">{order.quantity} units</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="font-semibold">
                            {new Intl.NumberFormat('en-KE', {
                              style: 'currency',
                              currency: 'KES',
                            }).format(order.total_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Status</p>
                          <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'}>
                            {order.payment_status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Shipping Address</p>
                          <p className="text-sm">{order.shipping_address}</p>
                        </div>
                      </div>

                      {order.tracking_number && (
                        <div>
                          <p className="text-sm text-gray-500">Tracking Number</p>
                          <p className="font-mono text-sm">{order.tracking_number}</p>
                        </div>
                      )}

                      {order.notes && (
                        <div>
                          <p className="text-sm text-gray-500">Notes</p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <div className="flex gap-2">
                          {getNextStatus(order.status) && (
                            <Button
                              onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                              disabled={isUpdating}
                            >
                              {order.status === 'pending' && <Package className="w-4 h-4 mr-2" />}
                              {order.status === 'confirmed' && <Truck className="w-4 h-4 mr-2" />}
                              Mark as {getNextStatus(order.status)}
                            </Button>
                          )}
                          {order.status === 'pending' && (
                            <Button
                              variant="destructive"
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              disabled={isUpdating}
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
