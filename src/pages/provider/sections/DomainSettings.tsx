import type { Database } from '@/integrations/supabase/types';

type Provider = Database['public']['Tables']['providers']['Row'];

interface DomainSettingsProps {
  provider: Provider;
}

export default function DomainSettings({ provider }: DomainSettingsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Domain Settings</h2>
      <div>
        <p>Current Domain: {provider.domain_name || 'Not configured'}</p>
        {/* Domain configuration form will go here */}
      </div>
    </div>
  );
}
