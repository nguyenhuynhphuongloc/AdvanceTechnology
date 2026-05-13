'use client';

import { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';

interface CheckoutFormProps {
    orderId: string;
    onSuccess: () => void;
    onError: (message: string) => void;
}

export function CheckoutForm({ orderId, onSuccess, onError }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL can be the same page or a specific success page
                return_url: `${window.location.origin}/product/checkout?orderId=${orderId}&payment_success=true`,
            },
            redirect: 'if_required',
        });

        if (error) {
            onError(error.message || 'An unexpected error occurred.');
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess();
        } else {
            // Handle other statuses if necessary
            setIsProcessing(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-zinc-800/30 p-6 rounded-[32px] border border-zinc-800/50">
                <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            </div>

            <button
                disabled={isProcessing || !stripe || !elements}
                id="submit"
                className="w-full bg-accent text-white py-5 rounded-[24px] font-black text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-accent/20"
            >
                <span id="button-text">
                    {isProcessing ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            PROCESSING...
                        </div>
                    ) : (
                        "PAY NOW"
                    )}
                </span>
            </button>
        </form>
    );
}
