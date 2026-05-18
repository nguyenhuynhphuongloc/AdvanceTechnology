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
                        className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                            activeTab === tab
                                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50'
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
                <div className="bg-white border border-dashed border-gray-200 rounded-xl">
                    <SellerEmptyState
                        title="No orders found"
                        description={activeTab === 'all' ? 'Orders will appear here once customers place them.' : `No orders with status "${TAB_LABELS[activeTab]}".`}
                    />
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    {['Order ID', 'Parent Order', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <Link
                                                href={`/seller/orders/${order.id}`}
                                                className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                                            >
                                                #{order.id.slice(0, 8)}
                                            </Link>
                                            {order.trackingNumber && (
                                                <p className="text-[10px] text-gray-400 mt-0.5">Tracking: {order.trackingNumber}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-xs font-mono text-gray-400">#{order.orderId?.slice(0, 8) ?? '—'}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-sm text-gray-700">{order.items?.length ?? 0} item(s)</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-sm font-bold text-gray-900">{order.shopTotal.toLocaleString('vi-VN')}₫</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <SellerStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-xs text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex gap-2 flex-wrap">
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleConfirm(order.id)}
                                                        disabled={processingId === order.id}
                                                        className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50 transition-all"
                                                    >
                                                        Confirm
                                                    </button>
                                                )}
                                                {(order.status === 'confirmed' || order.status === 'processing') && (
                                                    <button
                                                        onClick={() => handleShip(order.id)}
                                                        disabled={processingId === order.id}
                                                        className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 disabled:opacity-50 transition-all"
                                                    >
                                                        Ship
                                                    </button>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <button
                                                        onClick={() => handleDeliver(order.id)}
                                                        disabled={processingId === order.id}
                                                        className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-cyan-100 disabled:opacity-50 transition-all"
                                                    >
                                                        Delivered
                                                    </button>
                                                )}
                                                {['pending', 'confirmed', 'processing'].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleCancel(order.id)}
                                                        disabled={processingId === order.id}
                                                        className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                {['delivered', 'cancelled'].includes(order.status) && (
                                                    <span className="text-xs text-gray-300">—</span>
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
