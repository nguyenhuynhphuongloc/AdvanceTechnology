'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    fetchSellerOrders,
    confirmShopOrder,
    shipShopOrder,
    deliverShopOrder,
    cancelSellerOrder,
    type ShopOrderResponse,
} from '@/lib/seller/order-api';
import { useSellerAuth } from '@/lib/seller/auth-context';
import SellerPageHeader from '@/components/seller/SellerPageHeader';
import SellerStatusBadge from '@/components/seller/SellerStatusBadge';
import SellerEmptyState from '@/components/seller/SellerEmptyState';
import SellerLoadingState from '@/components/seller/SellerLoadingState';

type TabType = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

const TAB_LABELS: Record<TabType, string> = {
    all: 'All',
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipped: 'Đã giao ĐVVC',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
};

export default function SellerOrdersPage() {
    const { user } = useSellerAuth();
    const [shopOrders, setShopOrders] = useState<ShopOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
    }, [user]);

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            try {
                const data = await fetchSellerOrders({ limit: 100 });
                setShopOrders(data.items ?? []);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        };
        if (user) loadOrders();
    }, [user]);

    const handleConfirm = async (id: string) => {
        if (!confirm('Confirm this order?')) return;
        setProcessingId(id);
        try {
            await confirmShopOrder(id);
            const data = await fetchSellerOrders({ limit: 100 });
            setShopOrders(data.items ?? []);
        } catch {
            alert('Failed to confirm order');
        } finally {
            setProcessingId(null);
        }
    };

    const handleShip = async (id: string) => {
        const trackingNumber = prompt('Enter tracking number:');
        if (!trackingNumber) return;
        const shippingProvider = prompt('Enter shipping provider (e.g. GHN, GHTK):', 'GHN');
        if (!shippingProvider) return;
        setProcessingId(id);
        try {
            await shipShopOrder(id, { trackingNumber, shippingProvider });
            const data = await fetchSellerOrders({ limit: 100 });
            setShopOrders(data.items ?? []);
        } catch {
            alert('Failed to ship order');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeliver = async (id: string) => {
        if (!confirm('Mark this order as delivered?')) return;
        setProcessingId(id);
        try {
            await deliverShopOrder(id);
            const data = await fetchSellerOrders({ limit: 100 });
            setShopOrders(data.items ?? []);
        } catch {
            alert('Failed to update order');
        } finally {
            setProcessingId(null);
        }
    };

    const handleCancel = async (id: string) => {
        const reason = prompt('Enter cancellation reason:');
        if (!reason) return;
        setProcessingId(id);
        try {
            await cancelSellerOrder(id, reason);
            const data = await fetchSellerOrders({ limit: 100 });
            setShopOrders(data.items ?? []);
        } catch {
            alert('Failed to cancel order');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredOrders = shopOrders.filter((order) => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    const tabs: TabType[] = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    return (
        <div>
            <SellerPageHeader
                title="Orders"
                subtitle="Manage and update status for customer orders"
            />

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === tab
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                : 'bg-zinc-900/60 border border-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
                        }`}
                    >
                        {TAB_LABELS[tab]}
                        {tab !== 'all' && (
                            <span className="ml-1.5 text-[10px] opacity-60">
                                ({shopOrders.filter((o) => o.status === tab).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <SellerLoadingState />
            ) : filteredOrders.length === 0 ? (
                <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl">
                    <SellerEmptyState
                        title="No orders found"
                        description={activeTab === 'all' ? 'Orders will appear here once customers place them.' : `No orders with status "${TAB_LABELS[activeTab]}".`}
                    />
                </div>
            ) : (
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-800/60">
                                    {['Order ID', 'Parent Order', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                                        <th key={h} className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-zinc-800/40 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3.5">
                                            <Link
                                                href={`/seller/orders/${order.id}`}
                                                className="text-sm font-black text-white hover:text-orange-400 transition-colors"
                                            >
                                                #{order.id.slice(0, 8)}
                                            </Link>
                                            {order.trackingNumber && (
                                                <p className="text-[10px] text-zinc-600 mt-0.5">Tracking: {order.trackingNumber}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-xs font-mono text-zinc-400">#{order.orderId?.slice(0, 8) ?? '—'}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-sm font-bold">{order.items?.length ?? 0} item(s)</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-sm font-black text-white">{order.shopTotal.toLocaleString('vi-VN')}đ</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <SellerStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-xs text-zinc-500">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex gap-2 flex-wrap">
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleConfirm(order.id)}
                                                        disabled={processingId === order.id}
                                                        className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/20 disabled:opacity-50 transition-all"
                                                    >
                                                        Confirm
                                                    </button>
                                                )}
                                                {(order.status === 'confirmed' || order.status === 'processing') && (
                                                    <button
                                                        onClick={() => handleShip(order.id)}
                                                        disabled={processingId === order.id}
                                                        className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-500/20 disabled:opacity-50 transition-all"
                                                    >
                                                        Ship
                                                    </button>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <button
                                                        onClick={() => handleDeliver(order.id)}
                                                        disabled={processingId === order.id}
                                                        className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-cyan-500/20 disabled:opacity-50 transition-all"
                                                    >
                                                        Delivered
                                                    </button>
                                                )}
                                                {['pending', 'confirmed', 'processing'].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleCancel(order.id)}
                                                        disabled={processingId === order.id}
                                                        className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-500/20 disabled:opacity-50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                {['delivered', 'cancelled'].includes(order.status) && (
                                                    <span className="text-[10px] font-bold text-zinc-600">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
