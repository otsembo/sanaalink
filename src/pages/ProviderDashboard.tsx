import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import ServicesProducts from './provider/sections/ServicesProducts';
import Bookings from './provider/sections/Bookings';
import Orders from './provider/sections/Orders';
import Reviews from './provider/sections/Reviews';
import Availability from './provider/sections/Availability';
import ProviderDashboardProfile from './provider/sections/ProviderDashboardProfile';
import DomainSettings from './provider/sections/DomainSettings';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/ui/dashboard/DashboardSidebar';
import { supabase } from '@/integrations/supabase/client';
import type { Provider } from '@/types/provider';

export default function ProviderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProvider = useCallback(async () => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProvider(data as Provider);
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.id]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  // Show loading state while authentication is being checked
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect to auth if user is not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Show loading state while provider data is being fetched
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading provider data...</div>;
  }

  // Redirect to provider registration if no provider profile exists
  if (!provider) {
    return <Navigate to="/register-provider" />;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 p-8">
        <Routes>
          <Route index element={<Navigate to="services-products" replace />} />
          <Route path="services-products" element={<ServicesProducts provider={provider} />} />
          <Route path="bookings" element={<Bookings provider={provider} />} />
          <Route path="orders" element={<Orders provider={provider} />} />
          <Route path="reviews" element={<Reviews provider={provider} />} />
          <Route path="profile" element={<ProviderDashboardProfile provider={provider} />} />
          <Route path="availability" element={<Availability provider={provider} />} />
          <Route path="domain" element={<DomainSettings provider={provider} />} />
        </Routes>
      </div>
    </div>
  );
}
