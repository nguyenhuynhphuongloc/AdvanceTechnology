'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    fetchSellerOrderDetail,
    confirmShopOrder,
    shipShopOrder,
    deliverShopOrder,
    cancelSellerOrder,
    type ShopOrderResponse,
} from '@/lib/seller/order-api';
import { useSellerAuth } from '@/lib/seller/auth-context';
import SellerPageHeader from '@/components/seller/SellerPageHeader';
import SellerStatusBadge from '@/components/seller/SellerStatusBadge';
import SellerLoadingState from '@/components/seller/SellerLoadingState';

export default function SellerOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useSellerAuth();
    const shopOrderId = params.id as string;

    const [shopOrder, setShopOrder] = useState<ShopOrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/seller/login');
            return;
        }
    }, [user, router]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchSellerOrderDetail(shopOrderId);
                setShopOrder(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load order');
            } finally {
                setLoading(false);
            }
        };
        if (user) load();
    }, [user, shopOrderId]);

    const reload = async () => {
        const data = await fetchSellerOrderDetail(shopOrderId);
        setShopOrder(data);
    };

    const handleConfirm = async () => {
        if (!confirm('Confirm this order?')) return;
        setProcessing(true);
        try {
            await confirmShopOrder(shopOrderId);
            await reload();
        } catch {
            alert('Failed to confirm order');
        } finally {
            setProcessing(false);
        }
    };

    const handleShip = async () => {
        const trackingNumber = prompt('Enter tracking number:');
        if (!trackingNumber) return;
        const shippingProvider = prompt('Enter shipping provider:', 'GHN');
        if (!shippingProvider) return;
        setProcessing(true);
        try {
            await shipShopOrder(shopOrderId, { trackingNumber, shippingProvider });
            await reload();
        } catch {
            alert('Failed to ship order');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeliver = async () => {
        if (!confirm('Mark as delivered?')) return;
        setProcessing(true);
        try {
            await deliverShopOrder(shopOrderId);
            await reload();
        } catch {
            alert('Failed to update order');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        const reason = prompt('Enter cancellation reason:');
        if (!reason) return;
        setProcessing(true);
        try {
            await cancelSellerOrder(shopOrderId, reason);
            await reload();
        } catch {
            alert('Failed to cancel order');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <SellerLoadingState />;

    if (error || !shopOrder) {
        return (
            <div className="text-center py-20">
                <p className="text-red-400 font-bold">{error || 'Order not found'}</p>
                <button onClick={() => router.push('/seller/orders')} className="mt-4 text-sm font-bold text-orange-400 hover:text-orange-300">
                    Back to orders
                </button>
            </div>
        );
    }

    return (
        <div>
            <SellerPageHeader
                title={`Order #${shopOrder.id.slice(0, 8)}`}
                subtitle={`Parent: #${shopOrder.orderId?.slice(0, 8) ?? '—'} · ${new Date(shopOrder.createdAt).toLocaleString('vi-VN')}`}
                backHref="/seller/orders"
            />

            {/* Status & Actions */}
            <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 mb-6">
                <div className="flex flex-wrap gap-6 items-start">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Status</p>
                        <SellerStatusBadge status={shopOrder.status} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Shop Total</p>
                        <p className="text-2xl font-black text-orange-400">{shopOrder.shopTotal.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Items</p>
                        <p className="text-xl font-black">{shopOrder.items?.length ?? 0}</p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6 flex-wrap">
                    {shopOrder.status === 'pending' && (
                        <button
                            onClick={handleConfirm}
                            disabled={processing}
                            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-500/20 disabled:opacity-50 transition-all"
                        >
                            {processing ? 'Processing...' : 'Confirm Order'}
                        </button>
                    )}
                    {(shopOrder.status === 'confirmed' || shopOrder.status === 'processing') && (
                        <button
                            onClick={handleShip}
                            disabled={processing}
                            className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-500/20 disabled:opacity-50 transition-all"
                        >
                            {processing ? 'Processing...' : 'Ship Order'}
                        </button>
                    )}
                    {shopOrder.status === 'shipped' && (
                        <button
                            onClick={handleDeliver}
                            disabled={processing}
                            className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-cyan-500/20 disabled:opacity-50 transition-all"
                        >
                            {processing ? 'Processing...' : 'Mark Delivered'}
                        </button>
                    )}
                    {['pending', 'confirmed', 'processing'].includes(shopOrder.status) && (
                        <button
                            onClick={handleCancel}
                            disabled={processing}
                            className="bg-red-500/10 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-500/20 disabled:opacity-50 transition-all"
                        >
                            {processing ? 'Processing...' : 'Cancel Order'}
                        </button>
                    )}
                </div>

                {shopOrder.cancelledAt && (
                    <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 font-bold text-sm">
                            Cancelled on {new Date(shopOrder.cancelledAt).toLocaleString('vi-VN')}
                        </p>
                        {shopOrder.cancelReason && (
                            <p className="text-zinc-400 text-sm mt-1">Reason: {shopOrder.cancelReason}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Shipping Info */}
            {(shopOrder.trackingNumber || shopOrder.shippingProvider) && (
                <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 mb-6">
                    <h2 className="text-base font-black mb-4">Shipping Information</h2>
                    <div className="grid grid-cols-2 gap-6">
                        {shopOrder.shippingProvider && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Provider</p>
                                <p className="font-bold">{shopOrder.shippingProvider}</p>
                            </div>
                        )}
                        {shopOrder.trackingNumber && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Tracking Number</p>
                                <p className="font-mono font-bold">{shopOrder.trackingNumber}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Items */}
            <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 mb-6">
                <h2 className="text-base font-black mb-4">Order Items ({shopOrder.items?.length ?? 0})</h2>
                <div className="space-y-0">
                    {shopOrder.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 py-4 border-b border-zinc-800/40 last:border-0">
                            <div className="w-14 h-14 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
                                {item.imageUrlSnapshot ? (
                                    <img src={item.imageUrlSnapshot} alt={item.productNameSnapshot} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-white truncate">{item.productNameSnapshot}</p>
                                {item.variantNameSnapshot && (
                                    <p className="text-xs text-zinc-500">{item.variantNameSnapshot}</p>
                                )}
                                {item.skuSnapshot && (
                                    <p className="text-[10px] text-zinc-600 font-mono">SKU: {item.skuSnapshot}</p>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold">{item.unitPrice.toLocaleString('vi-VN')}đ × {item.quantity}</p>
                                <p className="text-sm font-black text-orange-400">{item.lineTotal.toLocaleString('vi-VN')}đ</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 mb-8">
                <h2 className="text-base font-black mb-4">Financial Summary</h2>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Subtotal</span>
                        <span className="font-bold">{shopOrder.subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Shipping Fee</span>
                        <span className="font-bold">{shopOrder.shippingFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-800 pt-2 mt-2">
                        <span className="font-black text-base">Shop Total</span>
                        <span className="font-black text-lg text-orange-400">{shopOrder.shopTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
