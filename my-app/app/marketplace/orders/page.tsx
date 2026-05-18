'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchMyOrders,
  fetchOrderDetail,
  type Order,
  type OrderSummary,
} from '@/lib/marketplace';
import {
  Badge,
  Button,
  Card,
  CardContent,
  ChevronRightIcon,
  PackageIcon,
  buttonClassName,
  cn,
  formatVnd,
  imageFallback,
} from '@/components/marketplace/MarketplaceUI';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.split('; ').find((r) => r.startsWith('token='))?.split('=')[1] ?? null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  awaiting_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [details, setDetails] = useState<Record<string, Order>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const load = useCallback(async () => {
    const token = getToken();
    setIsLoggedIn(!!token);
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyOrders({ limit: 50 });
      setOrders(data.items);
      const detailEntries = await Promise.all(
        data.items.slice(0, 20).map(async (order) => {
          try {
            return [order.id, await fetchOrderDetail(order.id)] as const;
          } catch {
            return null;
          }
        }),
      );
      setDetails(Object.fromEntries(detailEntries.filter(Boolean) as Array<readonly [string, Order]>));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!isLoggedIn && !loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold">My Orders</h1>
        <Card className="p-12">
          <div className="text-center">
            <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">Please log in to view your orders</h3>
            <Link href="/marketplace/login?next=/marketplace/orders" className={buttonClassName()}>Log In</Link>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12">
          <div className="text-center">
            <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">Unable to load orders</h3>
            <p className="mb-4 text-gray-600">{error}</p>
            <Button onClick={load}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold">My Orders</h1>
        <Card className="p-12">
          <div className="text-center">
            <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">No orders yet</h3>
            <p className="mb-6 text-gray-600">You haven&apos;t placed any orders yet. Start shopping to see your orders here.</p>
            <Link href="/marketplace/products" className={buttonClassName()}>Start Shopping</Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Orders</h1>

      <div className="space-y-4">
        {orders.map((summary) => {
          const detail = details[summary.id];
          const items = detail?.shopOrders.flatMap((shopOrder) => shopOrder.items) || [];
          return (
            <Card key={summary.id} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold">Order #{summary.id}</h3>
                      <Badge className={cn(statusColors[summary.status] || 'bg-gray-100 text-gray-800', 'border-transparent')}>
                        {summary.status.charAt(0).toUpperCase() + summary.status.slice(1).replaceAll('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(summary.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold text-blue-600">{formatVnd(summary.totalAmount)}</p>
                    </div>
                    <Link href={`/marketplace/orders/${summary.id}`} className={buttonClassName({ variant: 'outline' })}>
                      View Details
                      <ChevronRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {items.slice(0, 3).map((item, index) => (
                      <div key={`${item.productId}-${item.variantId}-${index}`} className="flex gap-3">
                        <Image
                          src={item.imageUrlSnapshot || imageFallback(item.variantId, 80, 80)}
                          alt={item.productNameSnapshot}
                          width={64}
                          height={64}
                          unoptimized
                          className="h-16 w-16 rounded bg-gray-100 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium">{item.productNameSnapshot}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {items.length > 3 && (
                    <p className="mt-3 text-sm text-gray-600">+{items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}</p>
                  )}
                  {items.length === 0 && (
                    <p className="text-sm text-gray-600">{summary.shopOrderCount} shop order(s)</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
