import { Button } from '@/components/ui/button';
import { Globe, ExternalLink } from 'lucide-react';

interface WHMCSRedirectProps {
  domain?: string;
  className?: string;
}

export function WHMCSRedirect({ domain = "domains.sanaalink.me.ke", className }: WHMCSRedirectProps) {
  const handleRedirect = () => {
    // Redirect to WHMCS subdomain for domain registration
    window.open(`https://${domain}`, '_blank');
  };

  return (
    <Button 
      onClick={handleRedirect}
      className={className}
      variant="default"
    >
      <Globe className="h-4 w-4 mr-2" />
      Claim your Digital Identity
      <ExternalLink className="h-4 w-4 ml-2" />
    </Button>
  );
}