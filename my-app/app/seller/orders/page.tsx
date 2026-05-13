'use client';

import { useEffect, useState } from 'react';
import { fetchAdminOrders, approveOrder, deliverOrder, OrderResponse } from '@/lib/shopping/order-api';
import { useAuth } from '@/lib/shopping/auth-context';

export default function SellerOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminOrders();
            setOrders(data.items);
        } catch (err) {
            console.error('Failed to load orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            await approveOrder(id);
            await loadOrders();
        } catch (err) {
            alert('Failed to approve order');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeliver = async (id: string) => {
        setProcessingId(id);
        try {
            await deliverOrder(id);
            await loadOrders();
        } catch (err) {
            alert('Failed to mark as delivered');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'awaiting_approval': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'shipping': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'delivered': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'pending': return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Order Management</h1>
                <p className="text-zinc-500 font-medium">Review and update status for customer orders.</p>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="py-20 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[40px]">
                    <p className="text-zinc-500 font-bold">No orders found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-zinc-500">Order ID</th>
                                <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-zinc-500">Customer</th>
                                <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-zinc-500">Amount</th>
                                <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-zinc-500">Status</th>
                                <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-zinc-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors group">
                                    <td className="py-6 px-4">
                                        <span className="text-sm font-black text-white group-hover:text-accent transition-colors">#{order.id.slice(0, 8)}</span>
                                        <p className="text-[10px] text-zinc-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                    </td>
                                    <td className="py-6 px-4">
                                        <p className="text-sm font-bold text-white">{order.recipientEmail || 'Guest User'}</p>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="text-sm font-black text-white">${order.totalAmount.toFixed(2)}</span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className={`inline-block px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex gap-2">
                                            {order.status === 'awaiting_approval' && (
                                                <button
                                                    onClick={() => handleApprove(order.id)}
                                                    disabled={processingId === order.id}
                                                    className="bg-accent text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {order.status === 'shipping' && (
                                                <button
                                                    onClick={() => handleDeliver(order.id)}
                                                    disabled={processingId === order.id}
                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all"
                                                >
                                                    Mark Delivered
                                                </button>
                                            )}
                                            {order.status !== 'awaiting_approval' && order.status !== 'shipping' && (
                                                <span className="text-[10px] font-bold text-zinc-600">No actions</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
