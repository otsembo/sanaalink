import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Provider, Service, Product } from '@/types/provider';
import { supabase } from '@/integrations/supabase/client';
import { uploadMultipleImages } from '@/integrations/supabase/storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

interface ServicesProductsProps {
  provider: Provider;
}

export default function ServicesProducts({ provider }: ServicesProductsProps) {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editItem, setEditItem] = useState<Service | Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch services and products
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [servicesResponse, productsResponse] = await Promise.all([
        supabase
          .from('services')
          .select('*')
          .eq('provider_id', provider.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('*')
          .eq('provider_id', provider.id)
          .order('created_at', { ascending: false })
      ]);

      if (servicesResponse.error) throw servicesResponse.error;
      if (productsResponse.error) throw productsResponse.error;

      setServices(servicesResponse.data as Service[]);
      setProducts(productsResponse.data as Product[]);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services and products.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [provider.id, toast]);

  // Service/Product Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '', // for services
    stock: '', // for products
    category: provider.category,
    subCategory: provider.sub_category || '',
    images: [] as File[], // Optional
    isAvailable: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      stock: '',
      category: provider.category,
      subCategory: provider.sub_category || '',
      images: [],
      isAvailable: true,
    });
    setEditItem(null);
    setIsDialogOpen(false);
  };

  const populateFormForEdit = (item: Service | Product) => {
    setFormData({
      name: item.title,
      description: item.description,
      price: item.price.toString(),
      duration: 'duration' in item ? item.duration?.toString() || '' : '',
      stock: 'stock_quantity' in item ? item.stock_quantity.toString() : '',
      category: provider.category,
      subCategory: provider.sub_category || '',
      images: [], // Keep empty as we don't want to replace existing images by default
      isAvailable: 'availability' in item ? item.availability === 'available' : true,
    });
    setEditItem(item);
    setIsDialogOpen(true); // Open the dialog when editing
  };

  const handleImageUpload = async (files: File[], itemId: string, type: 'service' | 'product') => {
    try {
      const path = `${provider.id}/${type}/${itemId}`;
      const bucket = type === 'service' ? 'service-images' : 'product-images';
      const urls = await uploadMultipleImages(files, path, bucket);
      return urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const handleSubmit = async (type: 'service' | 'product') => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        throw new Error('Please enter a valid price');
      }

      // Product-specific validation
      if (type === 'product') {
        const stock = parseInt(formData.stock);
        if (isNaN(stock) || stock < 0) {
          throw new Error('Please enter a valid stock quantity');
        }
      }

      // Handle image updates
      let finalImages: string[] = [];
      if (editItem) {
        // If editing, keep existing images unless new ones are uploaded
        finalImages = (editItem.images || []).slice();
      }
      
      if (formData.images.length > 0) {
        const itemId = editItem?.id || 'temp';
        const uploadedImages = await handleImageUpload(formData.images, itemId, type);
        finalImages = [...finalImages, ...uploadedImages];
      }

      interface BaseItem {
        provider_id: string;
        title: string;
        description: string;
        price: number;
        category: string;
        images: string[]; // Always include images field
      }

      interface ServiceData extends BaseItem {
        duration?: number;
        availability: 'available' | 'unavailable';
      }

      interface ProductData extends BaseItem {
        stock_quantity: number;
      }

      const baseData: BaseItem = {
        provider_id: provider.id,
        title: formData.name,
        description: formData.description,
        price,
        category: formData.category,
        images: finalImages,
      };

      const itemData: ServiceData | ProductData = type === 'service'
        ? {
            ...baseData,
            duration: formData.duration ? parseInt(formData.duration) : undefined,
            availability: formData.isAvailable ? 'available' : 'unavailable'
          }
        : {
            ...baseData,
            stock_quantity: formData.stock ? parseInt(formData.stock) : 0
          };

      if (editItem) {
        // Update existing item
        const { error } = await supabase
          .from(type === 'service' ? 'services' : 'products')
          .update(itemData)
          .eq('id', editItem.id);

        if (error) throw error;

        toast({
          title: `${type === 'service' ? 'Service' : 'Product'} updated`,
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Create new item
        const { data, error } = await supabase
          .from(type === 'service' ? 'services' : 'products')
          .insert([itemData]);

        if (error) throw error;

        toast({
          title: `${type === 'service' ? 'Service' : 'Product'} created`,
          description: `${formData.name} has been created successfully.`,
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: `${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: 'service' | 'product') => {
    try {
      // First delete images from storage if they exist
      const item = type === 'service' 
        ? services.find(s => s.id === id)
        : products.find(p => p.id === id);

      if (item?.images?.length) {
        const bucket = type === 'service' ? 'service-images' : 'product-images';
        const imagePaths = item.images.map(url => {
          const parts = url.split('/');
          return parts[parts.length - 1];
        });
        
        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove(imagePaths);

        if (storageError) {
          console.error('Error deleting images:', storageError);
          // Continue with deletion even if image deletion fails
        }
      }

      // Delete the item from the database
      const { error } = await supabase
        .from(type === 'service' ? 'services' : 'products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: `${type === 'service' ? 'Service' : 'Product'} deleted`,
        description: 'The item has been deleted successfully.',
      });

      // Update local state
      if (type === 'service') {
        setServices(services.filter(s => s.id !== id));
      } else {
        setProducts(products.filter(p => p.id !== id));
      }

      await fetchItems(); // Refresh the list
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  // Fetch data and set up real-time subscriptions
  useEffect(() => {
    fetchItems();

    // Subscribe to services changes
    const servicesSubscription = supabase
      .channel('services_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `provider_id=eq.${provider.id}`,
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    // Subscribe to products changes
    const productsSubscription = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `provider_id=eq.${provider.id}`,
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      servicesSubscription.unsubscribe();
      productsSubscription.unsubscribe();
    };
  }, [provider.id, fetchItems]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Services & Products</h2>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add {activeTab === 'services' ? 'Service' : 'Product'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editItem ? 'Edit' : 'Add'} {activeTab === 'services' ? 'Service' : 'Product'}
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to {editItem ? 'update' : 'create'} a new {activeTab === 'services' ? 'service' : 'product'}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Price (KES)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              {activeTab === 'services' ? (
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="images">Images</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData({ ...formData, images: files });
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmit(activeTab === 'services' ? 'service' : 'product')}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat('en-KE', {
                        style: 'currency',
                        currency: 'KES',
                      }).format(service.price)}
                    </p>
                    {service.duration && (
                      <p className="text-sm text-gray-500">
                        Duration: {service.duration} minutes
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Status: {service.availability}
                    </p>
                    {service.images && service.images.length > 0 && (
                      <img 
                        src={service.images[0]} 
                        alt={service.title}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => populateFormForEdit(service)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Service</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {service.title}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(service.id, 'service')}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.title}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.images && product.images.length > 0 && (
                      <div className="relative aspect-video">
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="text-2xl font-bold">
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                          }).format(product.price)}
                        </p>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Stock: {product.stock_quantity} units
                      </p>
                      <p className="text-sm text-gray-500">
                        Category: {product.category}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => populateFormForEdit(product)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {product.title}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(product.id, 'product')}
                    disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
