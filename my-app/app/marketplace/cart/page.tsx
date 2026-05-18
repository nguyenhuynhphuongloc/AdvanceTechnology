'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchMyCart,
  removeCartItem,
  updateCartItem,
  type Cart,
  type CartItem,
} from '@/lib/marketplace';
import {
  ArrowRightIcon,
  Button,
  Card,
  CardContent,
  CartIcon,
  MinusIcon,
  PlusIcon,
  Separator,
  TrashIcon,
  buttonClassName,
  formatVnd,
  imageFallback,
} from '@/components/marketplace/MarketplaceUI';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.split('; ').find((r) => r.startsWith('token='))?.split('=')[1] ?? null;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadCart = useCallback(async () => {
    const token = getToken();
    setIsLoggedIn(!!token);
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCart(await fetchMyCart());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    try {
      setCart(await updateCartItem(itemId, { quantity }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update quantity');
    }
  }

  async function handleRemove(itemId: string) {
    try {
      setCart(await removeCartItem(itemId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to remove item');
    }
  }

  if (!isLoggedIn && !loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12">
          <div className="text-center">
            <CartIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">Please log in to view your cart</h3>
            <p className="mb-6 text-gray-600">You need to be logged in to add and view items in your cart.</p>
            <Link href="/marketplace/login?next=/marketplace/cart" className={buttonClassName()}>
              Log In
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading cart...</div>;
  }

  const cartItems = cart?.items || [];

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12">
          <div className="text-center">
            <CartIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">Your cart is empty</h3>
            <p className="mb-6 text-gray-600">Looks like you haven&apos;t added anything to your cart yet.</p>
            <Link href="/marketplace/products" className={buttonClassName()}>
              Start Shopping
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const groupedByShop = cartItems.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = {
        shopName: item.shopNameSnapshot || 'Shop',
        items: [] as CartItem[],
      };
    }
    acc[item.shopId].items.push(item);
    return acc;
  }, {} as Record<string, { shopName: string; items: CartItem[] }>);

  const total = cart?.subtotal || cartItems.reduce((sum, item) => sum + item.unitPriceSnapshot * item.quantity, 0);
  const quantityTotal = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {Object.entries(groupedByShop).map(([shopId, group]) => (
            <Card key={shopId}>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="font-semibold">{group.shopName}</h3>
                </div>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.itemId} className="flex gap-4">
                      <Link href={`/marketplace/products/${item.productId}`} className="flex-shrink-0">
                        <Image
                          src={item.imageUrlSnapshot || imageFallback(item.variantId, 160, 160)}
                          alt={item.productNameSnapshot}
                          width={96}
                          height={96}
                          unoptimized
                          className="h-24 w-24 rounded-lg bg-gray-100 object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/marketplace/products/${item.productId}`} className="line-clamp-2 font-semibold hover:text-blue-600">
                          {item.productNameSnapshot}
                        </Link>
                        {item.variantNameSnapshot && (
                          <p className="mt-1 text-sm text-gray-600">{item.variantNameSnapshot}</p>
                        )}
                        <p className="mt-2 text-lg font-bold text-blue-600">{formatVnd(item.unitPriceSnapshot)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center rounded-lg border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.itemId, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.itemId)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({quantityTotal} items)</span>
                  <span className="font-semibold">{formatVnd(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-600">Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{formatVnd(total)}</span>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={() => router.push('/marketplace/checkout')}>
                Proceed to Checkout
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/marketplace/products" className={buttonClassName({ variant: 'outline', className: 'w-full mt-2' })}>
                Continue Shopping
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
