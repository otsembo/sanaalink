import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Provider, DomainConfig } from '@/types/provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Copy, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DomainConfigurationProps {
  provider: Provider;
}

export default function DomainConfiguration({ provider }: DomainConfigurationProps) {
  const [domainConfig, setDomainConfig] = useState<DomainConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domain, setDomain] = useState('');
  const { toast } = useToast();

  const fetchDomainConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('domain_configs')
        .select('*')
        .eq('provider_id', provider.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No domain configuration found
          setDomainConfig(null);
        } else {
          throw error;
        }
      } else {
        setDomainConfig(data as DomainConfig);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching domain configuration';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [provider.id, toast]);

  useEffect(() => {
    fetchDomainConfig();
  }, [fetchDomainConfig]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate domain
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        throw new Error('Please enter a valid domain name');
      }

      const verificationToken = Math.random().toString(36).substring(2);
      const { error } = await supabase
        .from('domain_configs')
        .upsert({
          provider_id: provider.id,
          domain_name: domain,
          is_verified: false,
          verification_token: verificationToken,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Fetch updated config
      fetchDomainConfig();

      toast({
        title: 'Domain configuration saved',
        description: 'Please verify your domain by adding the DNS records.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving domain configuration';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'The verification token has been copied to your clipboard.',
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Domain Configuration</h2>
        {!domainConfig && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Globe className="mr-2 h-4 w-4" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Domain</DialogTitle>
                <DialogDescription>
                  Enter your domain name to customize your provider profile URL.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {domainConfig && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Domain: {domainConfig.domain_name}</CardTitle>
                <CardDescription>
                  Status:{' '}
                  <Badge variant={domainConfig.is_verified ? 'default' : 'secondary'}>
                    {domainConfig.is_verified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </CardDescription>
              </div>
              {!domainConfig.is_verified && (
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(domainConfig.verification_token!)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Verification Token
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!domainConfig.is_verified ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  To verify your domain ownership, add the following DNS records:
                </p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-mono text-sm">
                    Type: TXT
                    <br />
                    Host: @
                    <br />
                    Value: ujuzihub-verify={domainConfig.verification_token}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  After adding the DNS records, it may take up to 24 hours for the changes to propagate.
                </p>
              </div>
            ) : (
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-5 w-5" />
                <p>Your domain is verified and active.</p>
              </div>
            )}
          </CardContent>
         </Card>
       )}
     </div>
   );
}
