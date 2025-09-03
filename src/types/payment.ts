export interface MpesaSTKRequest {
    phone: string;
    amount: number;
    reference: string;
}

export interface MpesaSTKResponse {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
}

export interface MpesaSTKCallback {
    Body: {
        stkCallback: {
            MerchantRequestID: string;
            CheckoutRequestID: string;
            ResultCode: number;
            ResultDesc: string;
            CallbackMetadata?: {
                Item: Array<{
                    Name: string;
                    Value: string | number;
                }>;
            };
        };
    };
}

export interface BookingPayment {
    id: string;
    booking_id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    provider_id: string;
    customer_id: string;
    payment_method: 'mpesa';
    transaction_id?: string;
    transaction_ref?: string;
    created_at: string;
    updated_at?: string;
}
