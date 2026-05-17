'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchMyCart,
  updateCartItem,
  removeCartItem,
  type Cart,
} from '@/lib/marketplace';
import { CartShopGroup } from '@/components/marketplace';
import {
  MarketplaceEmptyState,
  MarketplaceErrorState,
  MarketplaceLoadingState,
  PriceText,
} from '@/components/marketplace';

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

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const loadCart = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyCart();
      setCart(data);
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((e as any).message ?? 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    try {
      const updated = await updateCartItem(itemId, { quantity });
      setCart(updated);
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((e as any).message ?? 'Failed to update quantity');
    }
  }

  async function handleRemove(itemId: string) {
    try {
      const updated = await removeCartItem(itemId);
      setCart(updated);
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((e as any).message ?? 'Failed to remove item');
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MarketplaceEmptyState
          title="Please log in to view your cart"
          description="You need to be logged in to add and view items in your cart."
          action={
            <Link
              href="/seller/login"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Log In
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MarketplaceLoadingState rows={3} columns={1} />
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MarketplaceErrorState message={error} onRetry={loadCart} />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Cart</h1>
        <MarketplaceEmptyState
          title="Your cart is empty"
          description="Start shopping to add items to your cart."
          action={
            <Link
              href="/marketplace/products"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  // Group items by shopId
  const byShop = cart.items.reduce<Record<string, typeof cart.items>>((acc, item) => {
    const key = item.shopId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const total = cart.subtotal;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(byShop).map(([shopId, items]) => (
            <CartShopGroup
              key={shopId}
              shopId={shopId}
              shopName={items[0]?.shopNameSnapshot}
              items={items}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items ({cart.items.length})</span>
                <span className="font-medium text-gray-700">{cart.items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shops</span>
                <span className="font-medium text-gray-700">{Object.keys(byShop).length}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <PriceText value={total} className="text-xl" />
              </div>
            </div>

            <button
              onClick={() => router.push('/marketplace/checkout')}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
            >
              Proceed to Checkout
            </button>

            <Link
              href="/marketplace/products"
              className="block text-center text-sm text-orange-500 hover:underline mt-3"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
