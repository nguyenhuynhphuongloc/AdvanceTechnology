'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchMyCart, checkout, type Cart } from '@/lib/marketplace';
import { PriceText } from '@/components/marketplace';
import { MarketplaceEmptyState, MarketplaceErrorState } from '@/components/marketplace';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.split('; ').find((r) => r.startsWith('token='))?.split('=')[1] ?? null;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    district: '',
  });

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    if (!token) { setLoading(false); return; }

    fetchMyCart()
      .then((data) => {
        setCart(data);
        if (data.items.length === 0) router.replace('/marketplace/cart');
      })
      .catch(() => setSubmitError('Failed to load cart. Please try again.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MarketplaceEmptyState
          title="Please log in to checkout"
          description=""
          action={
            <Link href="/seller/login" className="px-4 py-2 bg-orange-500 text-white rounded-lg">
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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-48 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MarketplaceErrorState title="Your cart is empty" message="" />
      </div>
    );
  }

  const itemsByShop = cart.items.reduce<Record<string, typeof cart.items>>((acc, item) => {
    const k = item.shopId;
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});

  function updateField(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  const isAddressFilled = Object.values(address).every((v) => v.trim().length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAddressFilled) {
      setSubmitError('Please fill in all shipping address fields.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await checkout({
        shippingAddress: address,
        paymentMethod: 'cod',
      });
      router.push(`/marketplace/orders/${result.orderId}`);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSubmitError((err as any).message ?? 'Checkout failed. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping address */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { key: 'fullName', label: 'Full Name', placeholder: 'Nguyen Van A', type: 'text' },
                  { key: 'phone', label: 'Phone', placeholder: '0901234567', type: 'tel' },
                  { key: 'street', label: 'Street Address', placeholder: '123 Main Street', type: 'text' },
                  { key: 'city', label: 'City', placeholder: 'Ho Chi Minh City', type: 'text' },
                  { key: 'district', label: 'District', placeholder: 'District 1', type: 'text' },
                ] as const).map(({ key, label, placeholder, type }) => (
                  <div key={key} className={key === 'street' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      type={type}
                      value={address[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      placeholder={placeholder}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Method
              </h2>
              <label className="flex items-center gap-3 p-3 border border-orange-200 bg-orange-50 rounded-lg cursor-pointer">
                <input type="radio" name="payment" value="cod" defaultChecked className="accent-orange-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Cash on Delivery (COD)</p>
                  <p className="text-xs text-gray-500">Pay when you receive your order</p>
                </div>
              </label>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !isAddressFilled}
              className="w-full mt-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-base"
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

            {/* Items by shop */}
            {Object.entries(itemsByShop).map(([shopId, items]) => (
              <div key={shopId} className="mb-4">
                {items[0]?.shopNameSnapshot && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {items[0].shopNameSnapshot}
                  </p>
                )}
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.itemId} className="flex justify-between gap-2">
                      <div className="flex gap-2 min-w-0">
                        <img
                          src={item.imageUrlSnapshot || `https://picsum.photos/seed/${item.variantId}/80/80`}
                          alt={item.productNameSnapshot}
                          className="w-10 h-10 rounded object-cover bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
                            {item.productNameSnapshot}
                          </p>
                          <p className="text-xs text-gray-400">x{item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-gray-700 shrink-0">
                        {(item.unitPriceSnapshot * item.quantity).toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <PriceText value={cart.subtotal} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
