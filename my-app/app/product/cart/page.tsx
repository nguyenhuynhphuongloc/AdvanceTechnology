'use client';

import Link from 'next/link';
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter';
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader';
import { useAuth } from '@/lib/shopping/auth-context';
import { useCart } from '@/lib/shopping/cart-context';
import { PRODUCT_LIST_PATH } from '@/lib/products/routes';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();

  const shippingFee = items.length > 0 ? 4.99 : 0;
  const finalTotal = totalPrice + shippingFee;

  return (
    <div className="storefront-page">
      <StorefrontHeader activeNav="cart" showSearch={false} />

      <main className="storefront-container" style={{ padding: '32px 0 0' }}>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Cart</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your cart</h1>
          </div>
          <p className="text-sm text-white/60">
            {items.length} item{items.length === 1 ? '' : 's'}
            {user ? ' - signed in' : ' - guest cart'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center sm:p-14">
            <p className="text-xl font-medium text-white/85 sm:text-2xl">Your cart is empty.</p>
            <p className="mt-2 text-white/55">Add products from the storefront to start building your order.</p>
            <Link
              href={PRODUCT_LIST_PATH}
              className="mt-6 inline-block rounded-full bg-[#0052ff] px-7 py-3 text-sm font-semibold text-white hover:bg-[#0b46cc]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-4">
              {items.map(({ id, product, quantity, variant }) => (
                <article
                  key={id}
                  className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[90px_minmax(0,1fr)] sm:gap-4 sm:p-4 md:grid-cols-[110px_minmax(0,1fr)_auto]"
                >
                  <img
                    src={product.imageUrl || `https://picsum.photos/seed/${product.slug ?? product.id}/800/800`}
                    alt={product.name}
                    className="h-[80px] w-[80px] rounded-xl object-cover sm:h-[90px] sm:w-[90px] md:h-[110px] md:w-[110px]"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-white">{product.name}</p>
                    <p className="mt-1 text-sm text-white/50">{product.category ?? 'Catalog item'}</p>
                    {variant ? (
                      <p className="mt-1 text-xs text-white/45">
                        {variant.color ?? 'Default'} / {variant.size ?? 'One size'}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm font-semibold text-white">
                      ${product.price.toFixed(2)} USD
                    </p>

                    <div className="mt-3 flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-black/30 p-1">
                      <button
                        onClick={() => updateQuantity(id, quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-white transition hover:bg-white/10"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-white">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(id, quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-white transition hover:bg-white/10"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-4 md:mt-0 md:flex-col md:items-end md:justify-between">
                    <p className="text-base font-semibold text-white">
                      ${(product.price * quantity).toFixed(2)}
                    </p>

                    <button
                      onClick={() => removeFromCart(id)}
                      className="rounded-lg px-2 py-1 text-xs text-white/50 transition hover:bg-red-500/15 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-semibold text-white">Order summary</h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)} USD`}</span>
                </div>
              </div>

              <div className="my-4 border-t border-white/10" />

              <div className="flex items-center justify-between text-base font-semibold text-white">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)} USD</span>
              </div>

              <button className="mt-6 w-full rounded-full bg-[#0052ff] py-3 text-sm font-semibold text-white transition hover:bg-[#0b46cc]">
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
