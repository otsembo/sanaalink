import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckRequest {
  name: string; // base name without TLD
  tlds?: string[]; // optional list of TLDs
}

interface Suggestion {
  domain: string;
  available: boolean;
  registerUrl?: string;
}

async function checkDomain(domain: string): Promise<{ available: boolean }> {
  const apiUrl = Deno.env.get('WHMCS_API_URL') || '';
  const identifier = Deno.env.get('WHMCS_API_IDENTIFIER') || '';
  const secret = Deno.env.get('WHMCS_API_SECRET') || '';

  if (!apiUrl || !identifier || !secret) {
    throw new Error('WHMCS API secrets are not configured');
  }

  const body = new URLSearchParams();
  body.append('identifier', identifier);
  body.append('secret', secret);
  body.append('action', 'DomainWhois');
  body.append('domain', domain);
  body.append('responsetype', 'json');

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WHMCS API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  // The DomainWhois response includes a `status` field which can be 'available' or 'unavailable'
  const status = (data?.status || '').toString().toLowerCase();
  return { available: status.includes('available') && !status.includes('unavailable') };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, tlds }: CheckRequest = await req.json();
    if (!name) {
      return new Response(JSON.stringify({ error: 'Missing name' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const base = name.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
    const list = (tlds && tlds.length ? tlds : ['co.ke', 'ke', 'or.ke', 'com', 'org']).slice(0, 10);

    const publicUrl = (Deno.env.get('WHMCS_PUBLIC_URL') || '').replace(/\/$/, '');

    const results: Suggestion[] = [];
    for (const tld of list) {
      const domain = `${base}.${tld}`;
      try {
        const { available } = await checkDomain(domain);
        const registerUrl = publicUrl ? `${publicUrl}/cart.php?a=add&domain=register&query=${encodeURIComponent(domain)}` : undefined;
        results.push({ domain, available, registerUrl });
      } catch (e) {
        // On error for a specific TLD, mark as unavailable to be safe
        results.push({ domain, available: false });
        console.error('WHMCS check error for', domain, e);
      }
    }

    return new Response(JSON.stringify({ suggestions: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('whmcs-domain error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});