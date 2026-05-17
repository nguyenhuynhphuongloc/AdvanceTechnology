'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { fetchOrderDetail, cancelOrder, type Order } from '@/lib/marketplace';
import { OrderStatusBadge, MarketplaceErrorState } from '@/components/marketplace';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchOrderDetail(id)
      .then(setOrder)
      .catch((e: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = e as any;
        if (err.message?.includes('404') || err.message?.includes('NotFound')) {
          setError('NOT_FOUND');
        } else {
          setError(err.message ?? 'Failed to load order');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (error === 'NOT_FOUND') notFound();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/marketplace/orders" className="text-sm text-orange-500 hover:underline mb-4 inline-block">
          &larr; Back to Orders
        </Link>
        <MarketplaceErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!order) return null;

  const canCancel = ['pending', 'awaiting_payment'].includes(order.status);
  const orderId = order.id;

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setCancelMsg(null);
    try {
      const updated = await cancelOrder(orderId, 'Cancelled by buyer');
      setOrder(updated);
      setCancelMsg('Order cancelled successfully.');
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCancelMsg((e as any).message ?? 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Link href="/marketplace/orders" className="text-sm text-orange-500 hover:underline inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Order ID</p>
            <p className="text-lg font-bold text-gray-900 break-all">{order.id}</p>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
          <OrderStatusBadge status={order.status} className="text-sm px-3 py-1.5" />
        </div>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Shipping Address
          </h2>
          <p className="text-sm font-medium text-gray-800">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-gray-500">
            {order.shippingAddress.street}, {order.shippingAddress.district}, {order.shippingAddress.city}
          </p>
          <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
        </div>
      )}

      {/* Shop orders */}
      {order.shopOrders.map((so, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">{so.shopName}</span>
            <OrderStatusBadge status={so.status} className="text-xs" />
          </div>

          <div className="divide-y divide-gray-100">
            {so.items.map((item, j) => (
              <div key={j} className="p-4 flex items-center gap-4">
                <img
                  src={item.imageUrlSnapshot || `https://picsum.photos/seed/${item.variantId}/160/160`}
                  alt={item.productNameSnapshot}
                  className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                    {item.productNameSnapshot}
                  </p>
                  <p className="text-xs text-gray-400">{item.variantNameSnapshot} &bull; SKU: {item.skuSnapshot}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">x{item.quantity}</p>
                  <p className="text-sm font-semibold text-orange-500">
                    {item.subtotal.toLocaleString('vi-VN')} VND
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
            <div className="text-right">
              <p className="text-xs text-gray-500">Shop Subtotal</p>
              <p className="text-sm font-bold text-gray-900">{so.subtotal.toLocaleString('vi-VN')} VND</p>
            </div>
          </div>
        </div>
      ))}

      {/* Payment */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Payment</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800 capitalize">
              {order.paymentMethod ?? 'COD'}
            </p>
            {order.paymentStatus && (
              <p className={`text-xs font-medium capitalize mt-0.5 ${
                order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.paymentStatus}
              </p>
            )}
          </div>
          <p className="text-xl font-bold text-orange-500">
            {order.totalAmount.toLocaleString('vi-VN')} VND
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
        {cancelMsg && (
          <p className={`text-sm font-medium ${cancelMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
            {cancelMsg}
          </p>
        )}
      </div>
    </div>
  );
}
