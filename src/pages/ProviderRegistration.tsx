import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

// Icons & Utils
import { ArrowLeft, ArrowRight, Upload, User, Building, MapPin, FileText, Image, Phone } from 'lucide-react';

// Services & Hooks
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import CategoryFilter from '@/components/ui/CategoryFilter';

const providerSchema = z.object({
  // Basic Info (matches providers table)
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  whatsapp: z.string().optional(),
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  
  // Categories (matches providers table)
  category: z.string().min(2, 'Category is required'),
  sub_category: z.string().optional(),
  
  // Location (combined into location field)
  county: z.string().min(2, 'County is required'),
  town: z.string().min(2, 'Town is required'),
  specific_area: z.string().min(2, 'Specific area is required'),
  
  // Profile and Images (matches providers table)
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  profile_image: z.any().optional(),
  portfolio_images: z.array(z.any()).optional(),
  
  // Contact Preferences (matches providers table)
  preferred_contact: z.enum(['email', 'phone', 'whatsapp']),
  
  // Terms and Conditions
  accept_terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type ProviderFormData = z.infer<typeof providerSchema>;

type FormFieldNames = keyof ProviderFormData;

interface RegistrationStepProps {
  form: ReturnType<typeof useForm<ProviderFormData>>;
  onNext?: () => void;
  onPrev?: () => void;
}

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
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu', 'Machakos',
  'Kajiado', 'Kisii', 'Nyeri', 'Kakamega', 'Kilifi', 'Bungoma', "Murang'a", 'Meru'
];

const towns: Record<string, string[]> = {
  'Nairobi': ['Westlands', 'Karen', 'Kilimani', 'Eastleigh', 'CBD', 'Lavington', 'Langata', 'South B', 'South C'],
  'Mombasa': ['Nyali', 'Bamburi', 'Tudor', 'Likoni', 'Shanzu', 'Mtwapa', 'Diani'],
  'Kisumu': ['CBD', 'Milimani', 'Kondele', 'Nyamasaria', 'Mamboleo'],
  'Nakuru': ['CBD', 'Section 58', 'Milimani', 'London', 'Shabab'],
  'Uasin Gishu': ['Eldoret Town', 'Langas', 'Pioneer', 'Kapsoya', 'Huruma'],
  'Kiambu': ['Thika', 'Ruiru', 'Kikuyu', 'Limuru', 'Kiambu Town'],
  'Machakos': ['Machakos Town', 'Athi River', 'Mlolongo', 'Masinga', 'Tala'],
  'Kajiado': ['Ngong', 'Kitengela', 'Ongata Rongai', 'Kajiado Town', 'Kiserian'],
  'Kisii': ['Kisii Town', 'Suneka', 'Ogembo', 'Keroka', 'Masimba'],
  'Nyeri': ['Nyeri Town', 'Karatina', 'Othaya', 'Mweiga', 'Naro Moru'],
};

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
      business_name: '',
      category: '',
      sub_category: '',
      county: '',
      town: '',
      specific_area: '',
      bio: '',
      preferred_contact: 'phone',
      accept_terms: false,
    },
  });

  const onSubmit = async (data: ProviderFormData) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Validate terms acceptance
      if (!data.accept_terms) {
        toast({
          title: 'Terms Not Accepted',
          description: 'Please accept the terms and conditions to continue.',
          variant: 'destructive',
        });
        return;
      }

      // Validate preferred contact method
      if (!data.preferred_contact) {
        toast({
          title: 'Contact Method Required',
          description: 'Please select your preferred contact method.',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);

      // Check for existing provider profile first
      const { data: existingProvider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProvider) {
        throw new Error('You already have a provider profile');
      }
      
      // Upload profile image if provided
      let profileUrl = null;
      if (data.profile_image) {
        const { data: profileData, error: profileError } = await supabase.storage
          .from('provider-images')
          .upload(`profile/${user.id}`, data.profile_image);
        
        if (profileError) {
          throw new Error('Failed to upload profile image: ' + profileError.message);
        }
        profileUrl = supabase.storage.from('provider-images').getPublicUrl(profileData.path).data.publicUrl;
      }
      
      // Upload portfolio images if provided
      const portfolioUrls: string[] = [];
      if (data.portfolio_images?.length) {
        for (const file of data.portfolio_images) {
          try {
            const { data: portfolioData, error: portfolioError } = await supabase.storage
              .from('provider-images')
              .upload(`portfolio/${user.id}/${file.name}`, file);
            
            if (portfolioError) {
              console.error('Failed to upload portfolio image:', portfolioError);
              continue; // Skip this image but continue with others
            }
            
            const { data: { publicUrl } } = supabase.storage
              .from('provider-images')
              .getPublicUrl(portfolioData.path);
            portfolioUrls.push(publicUrl);
          } catch (uploadError) {
            console.error('Error uploading portfolio image:', uploadError);
          }
        }
      }
      
      // Create provider record
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .insert({
          user_id: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          whatsapp: data.whatsapp || data.phone,
          business_name: data.business_name,
          location: `${data.specific_area}, ${data.town}, ${data.county}`,
          bio: data.bio,
          profile_image: profileUrl,
          portfolio_images: portfolioUrls,
          preferred_contact: data.preferred_contact,
          category: data.category,
          sub_category: data.sub_category,
          is_verified: false
        })
        .select()
        .single();
      
      if (providerError) {
        throw new Error('Failed to create provider profile: ' + providerError.message);
      }

      toast({
        title: 'Registration successful! 🎉',
        description: 'Your provider profile has been created and is pending verification.',
      });

      // Delay navigation slightly to ensure user sees success message
      setTimeout(() => {
        navigate('/provider/dashboard');
      }, 1500);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create provider profile.';
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Provider registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate current step before proceeding
  const validateStep = async () => {
    switch (currentStep) {
      case 1: // Basic Info
        return form.trigger(['name', 'email', 'phone']);
      case 2: // Business Details
        return form.trigger(['business_name', 'category']);
      case 3: // Location
        return form.trigger(['county', 'town', 'specific_area']);
      case 4: // Profile
        return form.trigger(['bio']);
      case 5: // Portfolio
        return true; // Portfolio is optional
      case 6: { // Final step
        // For the final step, validate all fields to ensure nothing was missed
        const allFields = await form.trigger();
        
        if (!allFields) {
          // If validation fails, show which step needs attention
          const errors = form.formState.errors;
          
          if (errors.name || errors.email || errors.phone) {
            setCurrentStep(1);
            toast({
              title: 'Basic Information Incomplete',
              description: 'Please complete your basic information first.',
              variant: 'destructive',
            });
          } else if (errors.business_name || errors.category) {
            setCurrentStep(2);
            toast({
              title: 'Business Details Incomplete',
              description: 'Please complete your business details.',
              variant: 'destructive',
            });
          } else if (errors.county || errors.town || errors.specific_area) {
            setCurrentStep(3);
            toast({
              title: 'Location Information Incomplete',
              description: 'Please complete your location information.',
              variant: 'destructive',
            });
          } else if (errors.bio) {
            setCurrentStep(4);
            toast({
              title: 'Profile Information Incomplete',
              description: 'Please complete your profile information.',
              variant: 'destructive',
            });
          } else if (!form.getValues('accept_terms')) {
            toast({
              title: 'Terms Not Accepted',
              description: 'Please accept the terms and conditions to continue.',
              variant: 'destructive',
            });
          }
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
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
              name="business_name"
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
                  <FormLabel>Business Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="service">Service Provider</SelectItem>
                      <SelectItem value="craft">Craft Business</SelectItem>
                      <SelectItem value="both">Both Services & Crafts</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose whether you offer services, crafts, or both.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Category</FormLabel>
                  <FormControl>
                    <CategoryFilter
                      onSelect={(category, subCategory) => {
                        form.setValue('category', category);
                        form.setValue('sub_category', subCategory || '');
                      }}
                      defaultCategory={field.value}
                      defaultSubCategory={form.watch('sub_category')}
                    />
                  </FormControl>
                  <FormDescription>
                    Select your primary business category and subcategory.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="county"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>County</FormLabel>
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

            <FormField
              control={form.control}
              name="town"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Town</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your town" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {towns[form.watch('county')]?.map((town) => (
                        <SelectItem key={town} value={town}>
                          {town}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specific_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Area</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Near Shopping Center" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a specific landmark or area name for easier location
                  </FormDescription>
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
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-5 w-5 text-kenya-sunset" />
              <h3 className="font-semibold text-lg">Contact Preferences</h3>
            </div>

            <FormField
              control={form.control}
              name="preferred_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Contact Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="How should customers contact you?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will be shown as your primary contact method
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Registration Summary</h4>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>Name:</strong> {form.watch('name')}</p>
                <p><strong>Business:</strong> {form.watch('business_name')}</p>
                <p><strong>Category:</strong> {form.watch('category') || 'None'} {form.watch('sub_category') ? `(${form.watch('sub_category')})` : ''}</p>
                <p><strong>Location:</strong> {`${form.watch('specific_area')}, ${form.watch('town')}, ${form.watch('county')}`}</p>
                <p><strong>Phone:</strong> {form.watch('phone')}</p>
                <p><strong>Contact Via:</strong> {form.watch('preferred_contact')}</p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="accept_terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Accept Terms and Conditions</FormLabel>
                    <FormDescription>
                      By checking this box, you agree to our terms of service and privacy policy.
                      Your profile will be reviewed and activated within 24 hours.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                Join Sanaa Link and connect with customers in your area
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