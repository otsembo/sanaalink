import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Provider } from '@/types/provider';
import ProviderDashboardLayout from '@/components/layouts/ProviderDashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Import dashboard sections (we'll create these next)
import ProviderOverview from './sections/ProviderOverview';
import ServicesProducts from './sections/ServicesProducts';
import Bookings from './sections/Bookings';
import Orders from './sections/Orders';
import Availability from './sections/Availability';
import DomainSettings from './sections/DomainConfiguration';
import Reviews from './sections/Reviews';
import Settings from './sections/ServicesProducts';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        if (!user?.id) {
          navigate('/auth');
          return;
        }

        const { data, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (providerError) throw providerError;

        if (!data) {
          navigate('/provider/register');
          return;
        }

      setProvider({
        ...data,
        preferred_contact: (data.preferred_contact as 'email' | 'phone' | 'whatsapp') || 'phone',
        portfolio_images: [],
        average_rating: 0,
        total_reviews: 0
      });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load provider data';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderData();

    // Set up real-time subscription for updates
    const channel = supabase.channel('provider_updates');
    
    const subscription = channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'providers',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProvider(payload.new as Provider);
          }
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [user, navigate, toast]);

  if (isLoading) {
    return (
      <ProviderDashboardLayout currentTab="overview">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </ProviderDashboardLayout>
    );
  }

  if (error) {
    return (
      <ProviderDashboardLayout currentTab="overview">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </ProviderDashboardLayout>
    );
  }

  if (!provider) {
    return <Navigate to="/provider/register" replace />;
  }

  return (
    <Routes>
      <Route 
        path="overview" 
        element={
          <ProviderDashboardLayout currentTab="overview">
            <ProviderOverview provider={provider} />
          </ProviderDashboardLayout>
        } 
      />
      <Route 
        path="services" 
        element={
          <ProviderDashboardLayout currentTab="services">
            <ServicesProducts provider={provider} />
          </ProviderDashboardLayout>
        } 
      />
      <Route 
        path="bookings" 
        element={
          <ProviderDashboardLayout currentTab="bookings">
            <Bookings provider={provider} />
          </ProviderDashboardLayout>
        } 
      />
      <Route 
        path="orders" 
        element={
          <ProviderDashboardLayout currentTab="orders">
            <Orders provider={provider} />
          </ProviderDashboardLayout>
        } 
      />
      <Route 
        path="availability" 
        element={
          <ProviderDashboardLayout currentTab="availability">
            <Availability provider={provider} />
          </ProviderDashboardLayout>
        } 
      />
      <Route 
        path="domain" 
        element={
          <ProviderDashboardLayout currentTab="domain">
            <DomainSettings provider={provider} />
          </ProviderDashboardLayout>
        } 
      />
      <Route 
        path="reviews" 
        element={
          <ProviderDashboardLayout currentTab="reviews">
            <Reviews provider={provider} />
          </ProviderDashboardLayout>
        } 
      />
      <Route 
        path="settings" 
        element={
          <ProviderDashboardLayout currentTab="settings">
            <Settings provider={provider} />
          </ProviderDashboardLayout>
        } 
      />
      <Route path="/" element={<Navigate to="overview" replace />} />
    </Routes>
  );
}
