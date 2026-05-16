'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/shopping/auth-context';
import { fetchMyOrders, OrderResponse } from '@/lib/shopping/order-api';
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader';
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type TabType = 'all' | 'awaiting_approval' | 'shipping' | 'delivered';

export default function OrderListPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    useEffect(() => {
        if (!user) {
            router.push('/product/account?mode=login&redirectTo=/product/orders');
            return;
        }

        const loadOrders = async () => {
            try {
                const data = await fetchMyOrders();
                setOrders(data);
            } catch (err) {
                console.error('Failed to load orders:', err);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [user, router]);

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'awaiting_approval': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'shipping': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'delivered': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'pending': return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
            case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'awaiting_approval': return 'Chờ duyệt';
            case 'shipping': return 'Đang giao';
            case 'delivered': return 'Đã giao thành công';
            case 'pending': return 'Chờ thanh toán';
            case 'failed': return 'Thất bại';
            default: return status;
        }
    };

    return (
        <div className="storefront-page bg-black min-h-screen text-white">
            <StorefrontHeader />

            <main className="storefront-container py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic">My Orders</h1>
                        <p className="text-zinc-500 font-medium">Track your purchases and order status.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-10 w-fit">
                    <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="Tất cả" />
                    <Tab active={activeTab === 'awaiting_approval'} onClick={() => setActiveTab('awaiting_approval')} label="Chờ duyệt" />
                    <Tab active={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')} label="Đang giao" />
                    <Tab active={activeTab === 'delivered'} onClick={() => setActiveTab('delivered')} label="Đã giao" />
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-32 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[40px]">
                        <p className="text-zinc-500 font-bold mb-6">No orders found in this category.</p>
                        <Link href="/product" className="inline-block bg-white !text-black px-8 py-4 rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all">
                            SHOP NOW
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8 hover:border-zinc-700 transition-all group">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-black text-zinc-500 uppercase tracking-tighter bg-zinc-800 px-3 py-1 rounded-full">
                                                    #{order.id.slice(0, 8)}
                                                </span>
                                                <span className="text-zinc-600 text-xs font-bold">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            {/* We don't have product details here, just variant IDs in the basic OrderResponse */}
                                            {/* In a real app, we'd fetch product info or include it in the snapshot */}
                                            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                                                <span className="text-sm font-bold text-zinc-400">Total Amount</span>
                                                <span className="text-lg font-black text-white">${order.totalAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm font-bold text-zinc-400">Payment</span>
                                                <span className="text-sm font-bold text-white uppercase">{order.paymentMethod}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Link 
                                                href={`/product/checkout?orderId=${order.id}`}
                                                className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold text-xs hover:bg-zinc-700 transition-all"
                                            >
                                                Details
                                            </Link>
                                            {order.status === 'pending' && (
                                                <Link 
                                                    href={`/product/checkout?orderId=${order.id}`}
                                                    className="px-6 py-3 bg-accent text-white rounded-xl font-black text-xs hover:opacity-90 transition-all"
                                                >
                                                    Pay Now
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <StorefrontFooter />
        </div>
    );
}

function Tab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all ${
                active ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
            {label}
        </button>
    );
}
