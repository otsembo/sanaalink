import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface STKPushRequest {
  phone: string;
  amount: number;
  reference: string;
  shortcode: string;
  passkey: string;
  consumerKey: string;
  consumerSecret: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const {
      phone,
      amount,
      reference,
      shortcode,
      passkey,
      consumerKey,
      consumerSecret
    }: STKPushRequest = await req.json()

    // Generate access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const authResponse = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    )

    if (!authResponse.ok) {
      throw new Error('Failed to get access token')
    }

    const authData = await authResponse.json()
    const accessToken = authData.access_token

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 14)
    const password = btoa(`${shortcode}${passkey}${timestamp}`)

    // Prepare STK Push request
    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: 'https://your-domain.com/api/mpesa/callback', // This would be your actual callback URL
      AccountReference: reference,
      TransactionDesc: `Payment for ${reference}`,
    }

    // Make STK Push request
    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushPayload),
      }
    )

    const stkData = await stkResponse.json()

    if (stkData.ResponseCode === '0') {
      // For demo purposes, we'll simulate a successful payment after 10 seconds
      setTimeout(async () => {
        try {
          const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          )

          // Update payment status to completed (simulating successful payment)
          await supabase
            .from('payments')
            .update({ 
              status: 'completed',
              transaction_id: `DEMO${Math.random().toString(36).substring(7).toUpperCase()}`,
              updated_at: new Date().toISOString()
            })
            .eq('transaction_ref', reference)
        } catch (error) {
          console.error('Error updating payment status:', error)
        }
      }, 10000) // Simulate 10 second delay for payment processing
    }

    return new Response(JSON.stringify(stkData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('STK Push error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})