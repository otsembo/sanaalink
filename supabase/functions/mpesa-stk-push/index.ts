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
      console.log(`STK Push successful for reference: ${reference}`)
      
      // For demo purposes, we'll simulate a successful payment after 10 seconds
      setTimeout(async () => {
        try {
          const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          )

          console.log(`Processing payment completion for reference: ${reference}`)
          
          // Update payment status to completed (simulating successful payment)
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .update({ 
              status: 'completed',
              transaction_id: `DEMO${Math.random().toString(36).substring(7).toUpperCase()}`,
              updated_at: new Date().toISOString()
            })
            .eq('transaction_ref', reference)
            .select()

          if (paymentError) {
            console.error('Error updating payment status:', paymentError)
            return
          }

          console.log(`Payment updated successfully:`, paymentData)

          // Update the related booking status if it exists
          if (paymentData && paymentData.length > 0) {
            const payment = paymentData[0]
            if (payment.booking_id) {
              const { error: bookingError } = await supabase
                .from('bookings')
                .update({ 
                  payment_status: 'completed',
                  status: 'confirmed',
                  updated_at: new Date().toISOString()
                })
                .eq('id', payment.booking_id)

              if (bookingError) {
                console.error('Error updating booking status:', bookingError)
              } else {
                console.log(`Booking ${payment.booking_id} confirmed successfully`)
              }
            }

            // Update order status if this is for an order
            const { data: orders } = await supabase
              .from('orders')
              .select('id')
              .eq('customer_id', payment.customer_id)
              .eq('total_amount', payment.amount)
              .eq('payment_status', 'pending')
              .limit(1)

            if (orders && orders.length > 0) {
              const { error: orderError } = await supabase
                .from('orders')
                .update({ 
                  payment_status: 'completed',
                  status: 'processing',
                  updated_at: new Date().toISOString()
                })
                .eq('id', orders[0].id)

              if (orderError) {
                console.error('Error updating order status:', orderError)
              } else {
                console.log(`Order ${orders[0].id} confirmed successfully`)
              }
            }
          }
        } catch (error) {
          console.error('Error processing payment completion:', error)
        }
      }, 10000) // Simulate 10 second delay for payment processing
    } else {
      console.log(`STK Push failed for reference: ${reference}, Response:`, stkData)
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