'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QuantityStepper } from './QuantityStepper';
import { PriceText } from './PriceText';
import type { CartItem } from '@/lib/marketplace';

interface CartShopGroupProps {
  shopId: string;
  shopName?: string;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}

export function CartShopGroup({
  shopId,
  shopName,
  items,
  onUpdateQuantity,
  onRemove,
}: CartShopGroupProps) {
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});

  async function handleQuantityChange(itemId: string, quantity: number) {
    setUpdating((prev) => ({ ...prev, [itemId]: true }));
    try {
      await onUpdateQuantity(itemId, quantity);
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  }

  async function handleRemove(itemId: string) {
    setRemoving((prev) => ({ ...prev, [itemId]: true }));
    try {
      await onRemove(itemId);
    } finally {
      setRemoving((prev) => ({ ...prev, [itemId]: false }));
    }
  }

  const shopSubtotal = items.reduce((sum, item) => sum + item.unitPriceSnapshot * item.quantity, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Shop header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        {shopName ? (
          <Link href={`/marketplace/shops/${shopId}`} className="text-sm font-semibold text-gray-800 hover:text-orange-500 transition-colors">
            {shopName}
          </Link>
        ) : (
          <span className="text-sm font-semibold text-gray-800">Shop</span>
        )}
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.itemId} className={`p-4 flex gap-4 ${removing[item.itemId] ? 'opacity-50' : ''}`}>
            {/* Image */}
            <Link href={`/marketplace/products/${item.productId}`} className="shrink-0">
              <img
                src={item.imageUrlSnapshot || `https://picsum.photos/seed/${item.variantId}/160/160`}
                alt={item.productNameSnapshot}
                className="w-20 h-20 rounded-lg object-cover bg-gray-100"
              />
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                  {item.productNameSnapshot}
                </h4>
                <button
                  onClick={() => handleRemove(item.itemId)}
                  disabled={removing[item.itemId]}
                  className="shrink-0 text-gray-300 hover:text-red-500 transition-colors p-1"
                  aria-label="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {item.variantNameSnapshot && (
                <p className="text-xs text-gray-400 mb-2">{item.variantNameSnapshot}</p>
              )}

              <div className="flex items-end justify-between gap-2">
                <PriceText value={item.unitPriceSnapshot} />
                <QuantityStepper
                  value={item.quantity}
                  onChange={(qty) => handleQuantityChange(item.itemId, qty)}
                  disabled={updating[item.itemId]}
                  className="h-8"
                />
              </div>

              <div className="text-right mt-1">
                <span className="text-sm font-semibold text-orange-600">
                  {(item.unitPriceSnapshot * item.quantity).toLocaleString('vi-VN')} VND
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shop subtotal */}
      <div className="px-4 py-3 bg-orange-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-600">Shop Subtotal</span>
        <PriceText value={shopSubtotal} />
      </div>
    </div>
  );
}
