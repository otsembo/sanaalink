import type { Database } from '@/integrations/supabase/types';

type Provider = Database['public']['Tables']['providers']['Row'];

interface ProviderDashboardProfileProps {
  provider: Provider;
}

export default function ProviderDashboardProfile({ provider }: ProviderDashboardProfileProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      {/* Profile form will go here */}
      <div>
        <p>Business Name: {provider.business_name}</p>
        <p>Category: {provider.category}</p>
        <p>Email: {provider.email}</p>
        <p>Phone: {provider.phone}</p>
        <p>WhatsApp: {provider.whatsapp}</p>
        <p>Location: {provider.location}</p>
        <p>Bio: {provider.bio}</p>
      </div>
    </div>
  );
}
