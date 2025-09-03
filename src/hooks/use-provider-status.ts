import { useEffect, useState, useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Provider, DatabaseProvider } from '@/types/provider';

interface ProviderStatusResult {
  /** Whether the user is a provider */
  isProvider: boolean;
  /** The provider's data if they are a provider */
  providerData: Provider | null;
  /** Whether the hook is currently loading */
  loading: boolean;
  /** Any error that occurred while fetching */
  error: PostgrestError | null;
  /** Function to manually refresh the provider status */
  refresh: () => Promise<void>;
}

interface UseProviderStatusOptions {
  /** Number of retries on failure */
  retries?: number;
  /** Whether to enable real-time updates */
  realtime?: boolean;
}

/**
 * Hook to check and monitor a user's provider status
 * @param userId - The ID of the user to check
 * @param options - Configuration options for the hook
 * @returns Object containing the provider status, data, loading state, and refresh function
 */
export function useProviderStatus(
  userId?: string,
  options: UseProviderStatusOptions = {}
): ProviderStatusResult {
  const [isProvider, setIsProvider] = useState(false);
  const [providerData, setProviderData] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { retries = 3, realtime = true } = options;

  const fetchProviderStatus = useCallback(async (noLoading = false) => {
    if (!userId) {
      setLoading(false);
      setIsProvider(false);
      setProviderData(null);
      return;
    }

    try {
      if (!noLoading) setLoading(true);
      setError(null);

      const { data: dbProvider, error: fetchError } = await supabase
        .from('providers')
        .select()
        .eq('user_id', userId)
        .maybeSingle();

      console.log('Fetched provider data:', dbProvider, error);

      if (fetchError) {
        throw fetchError;
      }


      if (dbProvider) {
        // Transform database provider to match Provider interface
        const provider: Provider = {
          ...dbProvider as DatabaseProvider,
          portfolio_images: [],
          preferred_contact: 'phone',
          average_rating: 0,
          total_reviews: 0
        };
        
        setIsProvider(true);
        setProviderData(provider);
      } else {
        setIsProvider(false);
        setProviderData(null);
      }
      
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const postgrestError = err as PostgrestError;
      setError(postgrestError);
      
      // Retry logic
      if (retryCount < retries) {
        setRetryCount(prev => prev + 1);
        setTimeout(fetchProviderStatus, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }
      
      console.error('Error checking provider status:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, retries, retryCount]);

  // Set up initial fetch and real-time subscription
  useEffect(() => {
    fetchProviderStatus();

    if (realtime && userId) {
      const subscription = supabase
        .channel('provider_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'providers',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('Real-time update:', payload);
            fetchProviderStatus(true);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId, realtime, fetchProviderStatus]);

  return { isProvider, providerData, loading, error, refresh: fetchProviderStatus };
}
