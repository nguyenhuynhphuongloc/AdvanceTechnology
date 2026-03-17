'use client';

import { useCart } from '@/lib/shopping/cart-context';
import { useAuth } from '@/lib/shopping/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/shopping/account');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#f7f7f7] p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/shopping" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/10 text-lg font-bold">▲</span>
              <span className="text-xl font-bold tracking-tight">ACME STORE</span>
            </Link>
          </div>
          <Link href="/shopping" className="text-sm text-black/50 hover:text-black">
            ← Tiếp tục mua hàng
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-black">Giỏ hàng của bạn</h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-12 text-center">
            <p className="text-lg text-black/50">Giỏ hàng trống.</p>
            <Link
              href="/shopping"
              className="mt-4 inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/80"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items */}
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-black">{product.name}</p>
                  <p className="text-sm text-black/50">{product.category}</p>
                  <p className="mt-1 text-sm font-semibold text-black">
                    ${product.price.toFixed(2)} USD
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 rounded-xl border border-black/10 p-1">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-medium text-black transition hover:bg-black/5"
                    aria-label="Giảm"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-medium text-black transition hover:bg-black/5"
                    aria-label="Tăng"
                  >
                    +
                  </button>
                </div>

                {/* Line total */}
                <p className="w-24 text-right text-sm font-semibold text-black">
                  ${(product.price * quantity).toFixed(2)}
                </p>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-black/30 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Xóa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Order summary */}
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <div className="flex items-center justify-between text-sm text-black/60">
                <span>Tạm tính</span>
                <span>${totalPrice.toFixed(2)} USD</span>
              </div>
              <div className="my-4 border-t border-black/10" />
              <div className="flex items-center justify-between text-base font-semibold text-black">
                <span>Tổng cộng</span>
                <span>${totalPrice.toFixed(2)} USD</span>
              </div>

              <button className="mt-6 w-full rounded-xl bg-black py-4 text-sm font-semibold text-white transition hover:bg-black/80">
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
