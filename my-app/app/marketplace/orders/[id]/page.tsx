'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { fetchOrderDetail, type Order, type OrderItem } from '@/lib/marketplace';
import {
  ArrowLeftIcon,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CheckCircleIcon,
  CreditCardIcon,
  MapPinIcon,
  PackageIcon,
  Separator,
  buttonClassName,
  cn,
  formatVnd,
  imageFallback,
} from '@/components/marketplace/MarketplaceUI';

interface PageProps {
  params: Promise<{ id: string }>;
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

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
};

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchOrderDetail(id)
      .then(setOrder)
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'Failed to load order';
        setError(message.includes('404') || message.toLowerCase().includes('not found') ? 'NOT_FOUND' : message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (error === 'NOT_FOUND') notFound();

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12">
          <div className="text-center">
            <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">Order not found</h3>
            <p className="mb-4 text-gray-600">The order you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/marketplace/orders" className={buttonClassName()}>View All Orders</Link>
          </div>
        </Card>
      </div>
    );
  }

  const groupedByShop = order.shopOrders.reduce((acc, shopOrder) => {
    acc[shopOrder.shopId] = {
      shopName: shopOrder.shopName,
      items: shopOrder.items,
    };
    return acc;
  }, {} as Record<string, { shopName: string; items: OrderItem[] }>);
  const shippingAddress = order.shippingAddress
    ? `${order.shippingAddress.street}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`
    : 'No shipping address available';
  const shippingFee = 30000;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/marketplace/orders" className={buttonClassName({ variant: 'ghost', className: 'mb-4' })}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Orders
      </Link>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn(statusColors[order.status] || 'bg-gray-100 text-gray-800', 'border-transparent px-4 py-2 text-sm')}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replaceAll('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedByShop).map(([shopId, group], index) => (
                <div key={shopId}>
                  <h4 className="mb-4 font-semibold">{group.shopName}</h4>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                        <Link href={`/marketplace/products/${item.productId}`}>
                          <Image
                            src={item.imageUrlSnapshot || imageFallback(item.variantId, 160, 160)}
                            alt={item.productNameSnapshot}
                            width={80}
                            height={80}
                            unoptimized
                            className="h-20 w-20 rounded bg-gray-100 object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/marketplace/products/${item.productId}`} className="line-clamp-2 font-semibold hover:text-blue-600">
                            {item.productNameSnapshot}
                          </Link>
                          {item.variantNameSnapshot && <p className="mt-1 text-sm text-gray-600">{item.variantNameSnapshot}</p>}
                          <p className="mt-1 text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{formatVnd(item.subtotal)}</p>
                          <p className="text-sm text-gray-600">{formatVnd(item.unitPriceSnapshot)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {index < Object.keys(groupedByShop).length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem title="Order Placed" description={new Date(order.createdAt).toLocaleString()} connected />
                {order.status !== 'pending' && order.status !== 'awaiting_payment' && (
                  <TimelineItem title="Payment Confirmed" description="Payment received" connected={['processing', 'shipped', 'delivered'].includes(order.status)} />
                )}
                {['processing', 'shipped', 'delivered'].includes(order.status) && (
                  <TimelineItem title="Processing" description="Your order is being prepared" connected={['shipped', 'delivered'].includes(order.status)} />
                )}
                {['shipped', 'delivered'].includes(order.status) && (
                  <TimelineItem title="Shipped" description="Your order is on the way" connected={order.status === 'delivered'} />
                )}
                {order.status === 'delivered' && <TimelineItem title="Delivered" description="Order successfully delivered" />}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{shippingAddress}</p>
              {order.shippingAddress?.fullName && <p className="mt-2 text-sm text-gray-600">{order.shippingAddress.fullName} · {order.shippingAddress.phone}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge className={cn(paymentStatusColors[order.paymentStatus || 'pending'] || 'bg-yellow-100 text-yellow-800', 'border-transparent')}>
                  {(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatVnd(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">{formatVnd(shippingFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">{formatVnd(order.totalAmount + shippingFee)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  title,
  description,
  connected = false,
}: {
  title: string;
  description: string;
  connected?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="h-3 w-3 rounded-full bg-green-600" />
        {connected && <div className="mt-2 h-full w-px bg-gray-300" />}
      </div>
      <div className="pb-4">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
