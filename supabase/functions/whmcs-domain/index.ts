import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Pre-define CORS headers for different environments
const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interfaces for type safety
interface CheckRequest {
  name: string;
  tlds?: string[];
}

interface Suggestion {
  domain: string;
  available: boolean;
  registerUrl?: string;
}

interface WhmcsApiCredentials {
  apiUrl: string;
  identifier: string;
  secret: string;
}

/**
 * Checks the availability of a single domain against the WHMCS API.
 * @param domain The full domain name to check.
 * @param creds The WHMCS API credentials.
 * @returns A promise that resolves to an object indicating availability.
 */
async function checkDomain(domain: string, creds: WhmcsApiCredentials): Promise<{ available: boolean }> {
  const body = new URLSearchParams({
    identifier: creds.identifier,
    secret: creds.secret,
    action: "DomainWhois",
    domain: domain,
    responsetype: "json",
  });

  const res = await fetch(creds.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    // Throw a detailed error for better debugging
    throw new Error(`WHMCS API error for ${domain}: ${res.status} ${text}`);
  }

  const data = await res.json();
  const status = (data?.status || "").toString().toLowerCase();
  
  // More robust check for availability
  return { available: status === 'available' };
}

/**
 * Sanitizes and prepares a domain name from user input.
 * @param name The base domain name.
 * @returns A sanitized domain name.
 */
function sanitizeBaseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
}

/**
 * Main request handler.
 */
serve(async (req) => {
  // Set CORS origin based on environment
  const origin = Deno.env.get("ENVIRONMENT") === "production" 
    ? Deno.env.get("FRONTEND_URL") // Replace with your actual frontend URL in production
    : "*";
  const specificCorsHeaders = { ...corsHeaders, "Access-Control-Allow-Origin": origin };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: specificCorsHeaders });
  }

  try {
    // Get WHMCS credentials once
    const apiUrl = Deno.env.get("WHMCS_API_URL");
    const identifier = Deno.env.get("WHMCS_API_IDENTIFIER");
    const secret = Deno.env.get("WHMCS_API_SECRET");

    if (!apiUrl || !identifier || !secret) {
      throw new Error("WHMCS API secrets are not configured");
    }
    const whmcsCreds: WhmcsApiCredentials = { apiUrl, identifier, secret };

    const { name, tlds }: CheckRequest = await req.json();
    if (!name) {
      return new Response(JSON.stringify({ error: "Missing domain name" }), {
        headers: { ...specificCorsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const base = sanitizeBaseName(name);
    const tldList = (tlds && tlds.length ? tlds : ["co.ke", "ke", "or.ke", "com", "org"]).slice(0, 10);
    const publicUrl = (Deno.env.get("WHMCS_PUBLIC_URL") || "").replace(/\/$/, "");

    // Perform all domain checks in parallel
    const checkPromises = tldList.map(tld => {
      const domain = `${base}.${tld}`;
      return checkDomain(domain, whmcsCreds)
        .then(({ available }) => ({
          status: "fulfilled",
          value: {
            domain,
            available,
            registerUrl: publicUrl ? `${publicUrl}/cart.php?a=add&domain=register&query=${encodeURIComponent(domain)}` : undefined,
          },
        }))
        .catch(error => ({
          status: "rejected",
          reason: error,
          domain, // Include domain in rejected status for context
        }));
    });

    const results = await Promise.all(checkPromises);

    const suggestions: Suggestion[] = [];
    results.forEach(result => {
      if (result.status === "fulfilled") {
        suggestions.push(result.value);
      } else {
        // Log the specific error and mark as unavailable
        console.error(`WHMCS check failed for ${result.domain}:`, result.reason);
        suggestions.push({ domain: result.domain, available: false });
      }
    });

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...specificCorsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // Log the error and return a generic message
    console.error("whmcs-domain main error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), {
      headers: { ...specificCorsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
