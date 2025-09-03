import type { MpesaSTKRequest, MpesaSTKResponse } from '@/types/payment';
import { supabase } from './client';

// M-Pesa Daraja test credentials
const MPESA_TEST = {
  SHORTCODE: '174379',
  PASSKEY: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  CONSUMER_KEY: 'nk16Y74eSbTaGQgc9PFgRgw5pGM6Aald',
  CONSUMER_SECRET: 'vYtmzqZbzZGYgfYE'
};

export const initiateSTKPush = async (data: MpesaSTKRequest): Promise<MpesaSTKResponse> => {
  try {
    const { data: response, error } = await supabase.functions.invoke('mpesa-stk-push', {
      body: {
        phone: data.phone,
        amount: data.amount,
        reference: data.reference,
        shortcode: MPESA_TEST.SHORTCODE,
        passkey: MPESA_TEST.PASSKEY,
        consumerKey: MPESA_TEST.CONSUMER_KEY,
        consumerSecret: MPESA_TEST.CONSUMER_SECRET
      }
    });

    if (error) throw error;
    return response;
  } catch (error) {
    console.error('Error initiating STK push:', error);
    throw error;
  }
};
