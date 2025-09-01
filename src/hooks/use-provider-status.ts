import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Provider } from '@/types/provider';

export function useProviderStatus(userId?: string) {
  const [isProvider, setIsProvider] = useState(false);
  const [providerData, setProviderData] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkProviderStatus() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data: provider, error } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setIsProvider(!!provider);
        setProviderData(provider);
      } catch (error) {
        console.error('Error checking provider status:', error);
      } finally {
        setLoading(false);
      }
    }

    checkProviderStatus();
  }, [userId]);

  return { isProvider, providerData, loading };
}
