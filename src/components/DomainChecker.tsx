import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Check, X, Globe, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DomainSuggestion {
  domain: string;
  available: boolean;
  registerUrl?: string;
}


const DomainChecker = () => {
  const [domainName, setDomainName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<DomainSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!domainName.trim()) return;
    setIsChecking(true);
    setError(null);

    try {
      const baseName = domainName.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
      const { data, error } = await supabase.functions.invoke('whmcs-domain', {
        body: {
          name: baseName,
          tlds: ['co.ke','ke','or.ke','com','org']
        }
      });
      if (error) throw error;
      setResults((data as any)?.suggestions || []);
    } catch (e: any) {
      console.error('Domain check failed', e);
      setError(e?.message || 'Failed to check domain availability');
      setResults(null);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section id="domains" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Claim Your Digital Identity
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Check if your business name is available as a .ke domain and get suggestions for alternatives. 
              Build your online presence with our integrated website builder.
            </p>
          </div>

          {/* Domain Search */}
          <Card className="shadow-card bg-card-gradient border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-primary" />
                Domain Availability Checker
              </CardTitle>
              <CardDescription>
                Enter your business or craft name to check .ke domain availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Enter your business name..."
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCheck} 
                  disabled={isChecking || !domainName.trim()}
                  variant="hero"
                  className="sm:w-auto"
                >
                  {isChecking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Check Availability
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <div className="grid gap-4 md:grid-cols-2">
              {results.map((result: any, index: number) => (
                <Card 
                  key={index} 
                  className={`transition-all duration-300 hover:shadow-card ${
                    result.available 
                      ? 'border-accent/50 bg-card-gradient' 
                      : 'border-border/30 bg-muted/20'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          result.available 
                            ? 'bg-accent/20 text-accent' 
                            : 'bg-destructive/20 text-destructive'
                        }`}>
                          {result.available ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{result.domain}</h3>
                          <p className="text-sm text-muted-foreground">{result.price}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={result.available ? 'default' : 'secondary'}>
                          {result.available ? 'Available' : 'Taken'}
                        </Badge>
                        {result.available && (
                          <Button size="sm" variant="accent">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Register
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Website Builder CTA */}
          {results && (
            <Card className="mt-8 bg-hero-gradient text-white border-0">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Ready to Register?</h3>
                <p className="mb-4 opacity-90">
                  Click Register on an available domain to complete purchase in our WHMCS portal.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default DomainChecker;