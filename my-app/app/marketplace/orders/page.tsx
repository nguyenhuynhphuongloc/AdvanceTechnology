'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchMyOrders, type OrderSummary } from '@/lib/marketplace';
import { OrderStatusBadge } from '@/components/marketplace';
import {
  MarketplaceEmptyState,
  MarketplaceErrorState,
  MarketplaceLoadingState,
} from '@/components/marketplace';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.split('; ').find((r) => r.startsWith('token='))?.split('=')[1] ?? null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyOrders({ limit: 50 });
      setOrders(data.items);
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((e as any).message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MarketplaceEmptyState
          title="Please log in to view your orders"
          action={
            <Link href="/seller/login" className="px-4 py-2 bg-orange-500 text-white rounded-lg">
              Log In
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <MarketplaceLoadingState rows={5} columns={1} />
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <MarketplaceErrorState message={error} onRetry={load} />
    </div>
  );

  if (orders.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <MarketplaceEmptyState
        title="No orders yet"
        description="Your completed orders will appear here."
        action={
          <Link href="/marketplace/products" className="px-4 py-2 bg-orange-500 text-white rounded-lg">
            Start Shopping
          </Link>
        }
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/marketplace/orders/${order.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                <p className="text-sm font-semibold text-gray-900">{order.id}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>
                {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>
              {order.paymentMethod && (
                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                  {order.paymentMethod.toUpperCase()}
                </span>
              )}
              {order.paymentStatus && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full capitalize">
                  {order.paymentStatus}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">{order.shopOrderCount} shop(s)</span>
              <p className="text-base font-bold text-orange-500">
                {order.totalAmount.toLocaleString('vi-VN')} VND
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
