import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Upload, User, Building, MapPin, FileText, Image, Phone } from 'lucide-react';

const providerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  whatsapp: z.string().optional(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  category: z.string().min(1, 'Please select a category'),
  subCategory: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
});

type ProviderFormData = z.infer<typeof providerSchema>;

const categories = [
  'Home Maintenance',
  'Construction',
  'Automotive',
  'Property Care',
  'Art & Decor',
  'Fashion & Textiles',
  'Pottery & Ceramics',
  'Woodwork',
  'Jewelry',
  'Food Products',
];

const subCategories: Record<string, string[]> = {
  'Home Maintenance': ['Plumbing', 'Electrical', 'HVAC', 'General Repair'],
  'Construction': ['Masonry', 'Carpentry', 'Welding', 'Painting'],
  'Automotive': ['Mechanics', 'Car Wash', 'Tire Repair', 'Auto Electrician'],
  'Property Care': ['Cleaning', 'Gardening', 'Security', 'Pest Control'],
  'Art & Decor': ['Paintings', 'Sculptures', 'Wall Art', 'Interior Design'],
  'Fashion & Textiles': ['Clothing', 'Bags', 'Accessories', 'Traditional Wear'],
  'Pottery & Ceramics': ['Vases', 'Dishes', 'Decorative Items', 'Custom Pottery'],
  'Woodwork': ['Furniture', 'Carvings', 'Home Decor', 'Custom Woodwork'],
  'Jewelry': ['Traditional Jewelry', 'Modern Jewelry', 'Custom Pieces', 'Repairs'],
  'Food Products': ['Spices', 'Preserves', 'Snacks', 'Traditional Foods'],
};

const counties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 
  'Garissa', 'Kakamega', 'Nyeri', 'Machakos', 'Meru', 'Kericho', 'Kisii'
];

const ProviderRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 6;

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      phone: '',
      whatsapp: '',
      businessName: '',
      category: '',
      subCategory: '',
      location: '',
      bio: '',
    },
  });

  const onSubmit = async (data: ProviderFormData) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to register as a provider.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('providers')
        .insert([
          {
            user_id: user.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            whatsapp: data.whatsapp,
            business_name: data.businessName,
            category: data.category,
            sub_category: data.subCategory,
            location: data.location,
            bio: data.bio,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'Registration successful!',
        description: 'Your provider profile has been created.',
      });

      navigate('/provider-dashboard');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create provider profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-kenya-sunset" />
              <h3 className="font-semibold text-lg">Basic Information</h3>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+254 700 000 000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+254 700 000 000" {...field} />
                  </FormControl>
                  <FormDescription>
                    If different from phone number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-kenya-sunset" />
              <h3 className="font-semibold text-lg">Business Details</h3>
            </div>
            
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your business name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your service category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch('category') && (
              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-category (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sub-category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subCategories[form.watch('category')]?.map((subCategory) => (
                          <SelectItem key={subCategory} value={subCategory}>
                            {subCategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-kenya-sunset" />
              <h3 className="font-semibold text-lg">Location Setup</h3>
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your county" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-kenya-sunset" />
              <h3 className="font-semibold text-lg">Profile Creation</h3>
            </div>
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio/Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell customers about your business, experience, and what makes you unique..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be displayed on your public profile
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Image className="h-5 w-5 text-kenya-sunset" />
              <h3 className="font-semibold text-lg">Portfolio Upload</h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Upload photos of your work</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 10MB each (coming soon)</p>
              <Button variant="outline" className="mt-4" disabled>
                Choose Files
              </Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-5 w-5 text-kenya-sunset" />
              <h3 className="font-semibold text-lg">Contact Preferences</h3>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Registration Summary</h4>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>Name:</strong> {form.watch('name')}</p>
                <p><strong>Business:</strong> {form.watch('businessName')}</p>
                <p><strong>Category:</strong> {form.watch('category')}</p>
                <p><strong>Location:</strong> {form.watch('location')}</p>
                <p><strong>Phone:</strong> {form.watch('phone')}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              By registering, you agree to our terms of service and privacy policy.
              Your profile will be reviewed and activated within 24 hours.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to register as a provider</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kenya-sunset/10 to-kenya-earth/10 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-kenya-earth">
                Become a Provider
              </CardTitle>
              <CardDescription className="text-center">
                Join Ujuzi Hub and connect with customers in your area
              </CardDescription>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(progress)}% complete
                  </span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {renderStep()}
                  
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    
                    {currentStep < totalSteps ? (
                      <Button type="button" onClick={nextStep}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegistration;