import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { orderId, amount } = await request.json();

        if (!amount) {
            return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
        }

        const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

        if (!STRIPE_SECRET) {
            console.error('STRIPE_SECRET_KEY is not defined in environment variables');
            return NextResponse.json({ error: 'Stripe API key not configured on server' }, { status: 500 });
        }

        const response = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET.trim()}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                amount: Math.round(amount * 100).toString(),
                currency: 'usd',
                'automatic_payment_methods[enabled]': 'true',
                'metadata[orderId]': orderId,
            }).toString(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Stripe API error:', errorData);
            return NextResponse.json({ error: errorData.error?.message || 'Failed to create payment intent' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ clientSecret: data.client_secret });
    } catch (err: any) {
        console.error('Error in payment intent route:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
