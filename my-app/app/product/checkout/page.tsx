'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchOrderById, OrderResponse, createPaymentIntent } from '@/lib/shopping/order-api';
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader';
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter';
import Link from 'next/link';
import { PRODUCT_LIST_PATH } from '@/lib/products/routes';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/shopping/CheckoutForm';
import { notification } from 'antd';

// Initialize Stripe with placeholder - user should update this in .env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const paymentSuccess = searchParams.get('payment_success');
    
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [status, setStatus] = useState<'processing' | 'confirmed' | 'failed' | 'awaiting_payment'>('processing');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            router.push(PRODUCT_LIST_PATH);
            return;
        }

        if (paymentSuccess === 'true') {
            setStatus('confirmed');
            return;
        }

        let intervalId: NodeJS.Timeout;

        const checkStatus = async () => {
            try {
                const data = await fetchOrderById(orderId);
                setOrder(data);
                
                if (data.status === 'awaiting_payment' && !clientSecret) {
                    setStatus('awaiting_payment');
                    // Fetch client secret if not already done
                    const { clientSecret: secret } = await createPaymentIntent(orderId, data.totalAmount);
                    setClientSecret(secret);
                    clearInterval(intervalId);
                } else if (data.status === 'awaiting_approval' || data.status === 'confirmed') {
                    setStatus('confirmed');
                    clearInterval(intervalId);
                } else if (data.status === 'failed') {
                    setStatus('failed');
                    setError(data.failureReason || 'Order processing failed.');
                    clearInterval(intervalId);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        checkStatus();
        intervalId = setInterval(checkStatus, 2000);

        return () => clearInterval(intervalId);
    }, [orderId, router, clientSecret, paymentSuccess]);
    
    useEffect(() => {
        if (status === 'confirmed') {
            notification.success({
                message: 'Thanh toán thành công!',
                description: `Đơn hàng #${orderId?.slice(0, 8)} của bạn đã được xác nhận.`,
                placement: 'topRight',
                duration: 5,
            });
        } else if (status === 'failed' && error) {
            notification.error({
                message: 'Thanh toán thất bại',
                description: error,
                placement: 'topRight',
            });
        }
    }, [status, orderId, error]);

    const appearance = {
        theme: 'night' as const,
        variables: {
            colorPrimary: '#ff4d00',
        },
    };

    const options = {
        clientSecret: clientSecret || '',
        appearance,
    };

    return (
        <div className="storefront-page bg-black min-h-screen text-white">
            <StorefrontHeader showSearch={false} />

            <main className="storefront-container py-20 flex flex-col items-center justify-center">
                <div className="w-full max-w-lg bg-zinc-900/50 border border-zinc-800 rounded-[40px] p-10 shadow-2xl backdrop-blur-xl">
                    {status === 'processing' && (
                        <div className="text-center space-y-8 py-10">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-accent rounded-full animate-spin"></div>
                            </div>
                            
                            <div>
                                <h1 className="text-3xl font-black tracking-tight mb-3">Processing Order</h1>
                                <p className="text-zinc-400 font-medium leading-relaxed">
                                    We're communicating with the services and reserving your items.
                                </p>
                            </div>

                            <div className="space-y-3 pt-4 text-left max-w-xs mx-auto">
                                <Step item="Validating order" active={true} done={false} />
                                <Step item="Reserving inventory" active={false} done={false} />
                                <Step item="Confirming payment" active={false} done={false} />
                            </div>
                        </div>
                    )}

                    {status === 'awaiting_payment' && clientSecret && (
                        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-center">
                                <h1 className="text-3xl font-black tracking-tight mb-3">Complete Payment</h1>
                                <p className="text-zinc-400 font-medium leading-relaxed mb-6">
                                    Inventory reserved! Please complete your payment to finalize the order.
                                </p>
                                <div className="inline-block bg-accent/10 px-4 py-2 rounded-full border border-accent/20 mb-8">
                                    <span className="text-accent font-black text-lg">${order?.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <Elements stripe={stripePromise} options={options}>
                                <CheckoutForm 
                                    orderId={orderId!} 
                                    onSuccess={async () => {
                                        setStatus('confirmed');
                                        try {
                                            // Finalize order in backend after payment
                                            await (await import('@/lib/shopping/order-api')).approveOrder(orderId!);
                                        } catch (err) {
                                            console.error("Order finalization failed:", err);
                                        }
                                    }}
                                    onError={(msg) => setError(msg)}
                                />
                            </Elements>
                        </div>
                    )}

                    {status === 'confirmed' && (
                        <div className="text-center space-y-8 py-10 animate-in fade-in zoom-in duration-700">
                            <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </div>

                            <div>
                                <h1 className="text-3xl font-black tracking-tight mb-3">Payment Successful!</h1>
                                <p className="text-zinc-400 font-medium leading-relaxed">
                                    Your order <span className="text-white font-bold">#{orderId?.slice(0, 8)}</span> is now <span className="text-accent font-bold">Awaiting Approval</span> from the seller.
                                </p>
                            </div>

                            <div className="bg-zinc-800/50 rounded-3xl p-6 border border-zinc-700/50">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-zinc-500">Order ID</span>
                                    <span className="font-bold text-white text-xs">{orderId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Status</span>
                                    <span className="font-black text-accent uppercase">Awaiting Approval</span>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Link 
                                    href="/product/orders"
                                    className="block w-full bg-white !text-black py-4 rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all text-center"
                                >
                                    VIEW MY ORDERS
                                </Link>
                                <Link 
                                    href={PRODUCT_LIST_PATH}
                                    className="block w-full border border-zinc-700 py-4 rounded-2xl font-bold text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                                >
                                    CONTINUE SHOPPING
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="text-center space-y-8 py-10 animate-in fade-in zoom-in duration-700">
                            <div className="mx-auto w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </div>

                            <div>
                                <h1 className="text-3xl font-black tracking-tight mb-3">Order Failed</h1>
                                <p className="text-zinc-400 font-medium leading-relaxed">
                                    {error || "We couldn't process your order. Please try again."}
                                </p>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Link 
                                    href="/product/cart"
                                    className="block w-full bg-white text-black py-4 rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all"
                                >
                                    BACK TO CART
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <StorefrontFooter />
        </div>
    );
}

function Step({ item, active, done }: { item: string; active: boolean; done: boolean }) {
    return (
        <div className={`flex items-center gap-3 text-sm font-bold ${active ? 'text-accent' : done ? 'text-green-500' : 'text-zinc-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-accent animate-pulse' : done ? 'bg-green-500' : 'bg-zinc-800'}`}></span>
            {item}
        </div>
    );
}
