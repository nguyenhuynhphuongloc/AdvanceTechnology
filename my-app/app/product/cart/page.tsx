'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter';
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader';
import { fetchProductBySlug } from '@/lib/products/api';
import { useAuth } from '@/lib/shopping/auth-context';
import { useCart } from '@/lib/shopping/cart-context';
import { PRODUCT_LIST_PATH } from '@/lib/products/routes';

type SyncStatus = {
  loading: boolean;
  updatedCount: number;
  itemIssues: Array<{
    itemId: string;
    kind: 'missing-product' | 'missing-variant';
    message: string;
  }>;
  error: string | null;
};

const initialSyncStatus: SyncStatus = {
  loading: false,
  updatedCount: 0,
  itemIssues: [],
  error: null,
};

function formatCurrency(value: number, locale = 'en-US', currency = 'USD') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, replaceItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(initialSyncStatus);

  const unavailableItemIds = useMemo(
    () => syncStatus.itemIssues.map((issue) => issue.itemId),
    [syncStatus.itemIssues],
  );
  const unavailableItemSet = useMemo(() => new Set(unavailableItemIds), [unavailableItemIds]);
  const checkoutItems = useMemo(
    () => items.filter((item) => !unavailableItemSet.has(item.id)),
    [items, unavailableItemSet],
  );
  const checkoutSubtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [checkoutItems],
  );

  const hasUnavailableItems = syncStatus.itemIssues.length > 0;
  const canCheckout = checkoutItems.length > 0 && !syncStatus.loading;

  const shippingFee = checkoutItems.length > 0 ? 4.99 : 0;
  const finalTotal = checkoutSubtotal + shippingFee;

  const issueByItemId = useMemo(() => {
    const map = new Map<string, SyncStatus['itemIssues'][number]>();
    syncStatus.itemIssues.forEach((issue) => {
      map.set(issue.itemId, issue);
    });
    return map;
  }, [syncStatus.itemIssues]);

  useEffect(() => {
    if (items.length === 0) {
      setSyncStatus(initialSyncStatus);
      return;
    }

    const uniqueSlugs = Array.from(
      new Set(
        items
          .map((item) => item.product.slug)
          .filter((slug): slug is string => Boolean(slug)),
      ),
    );

    if (uniqueSlugs.length === 0) {
      return;
    }

    let cancelled = false;

    const syncCartWithCatalog = async () => {
      setSyncStatus((prev) => ({ ...prev, loading: true, error: null }));

      const results = await Promise.allSettled(uniqueSlugs.map((slug) => fetchProductBySlug(slug)));

      if (cancelled) {
        return;
      }

      const detailsBySlug = new Map<string, Awaited<ReturnType<typeof fetchProductBySlug>>>();
      const notFoundSlugs = new Set<string>();
      let hadRequestError = false;

      results.forEach((result, index) => {
        const slug = uniqueSlugs[index];
        if (result.status === 'fulfilled') {
          detailsBySlug.set(slug, result.value);
          return;
        }

        const message =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason ?? 'Unknown catalog error');

        if (message.includes('status 404')) {
          notFoundSlugs.add(slug);
          return;
        }

        hadRequestError = true;
      });

      let updatedCount = 0;
      let didMutate = false;
      const itemIssues: SyncStatus['itemIssues'] = [];

      const nextItems = items.map((item) => {
        const slug = item.product.slug;
        if (!slug) {
          return item;
        }

        const detail = detailsBySlug.get(slug);
        if (!detail) {
          if (notFoundSlugs.has(slug)) {
            itemIssues.push({
              itemId: item.id,
              kind: 'missing-product',
              message: 'This product is no longer available in the storefront catalog.',
            });
          }

          return item;
        }

        const matchedVariant = item.variant
          ? detail.variants.find((variant) => variant.id === item.variant?.id)
          : null;

        if (item.variant && !matchedVariant) {
          itemIssues.push({
            itemId: item.id,
            kind: 'missing-variant',
            message: 'Selected variant is no longer available. Please remove this item.',
          });
          return item;
        }

        const nextPrice = matchedVariant?.price ?? item.product.price;
        const nextImageUrl = matchedVariant?.imageUrl || detail.mainImage.imageUrl;
        const nextName = detail.name;
        const nextCategory = detail.category;
        const nextVariant = matchedVariant
          ? {
              ...item.variant,
              sku: matchedVariant.sku,
              color: matchedVariant.color,
              size: matchedVariant.size,
              price: matchedVariant.price,
            }
          : item.variant;

        const hasChanged =
          item.product.name !== nextName ||
          item.product.category !== nextCategory ||
          item.product.imageUrl !== nextImageUrl ||
          item.product.price !== nextPrice ||
          (item.variant?.sku ?? '') !== (nextVariant?.sku ?? '') ||
          (item.variant?.color ?? '') !== (nextVariant?.color ?? '') ||
          (item.variant?.size ?? '') !== (nextVariant?.size ?? '') ||
          (item.variant?.price ?? 0) !== (nextVariant?.price ?? 0);

        if (!hasChanged) {
          return item;
        }

        didMutate = true;
        updatedCount += 1;

        return {
          ...item,
          product: {
            ...item.product,
            name: nextName,
            category: nextCategory,
            imageUrl: nextImageUrl,
            price: nextPrice,
          },
          variant: nextVariant,
        };
      });

      if (didMutate) {
        replaceItems(nextItems);
      }

      setSyncStatus({
        loading: false,
        updatedCount,
        itemIssues,
        error: hadRequestError
          ? 'Could not refresh all items from the live catalog right now.'
          : null,
      });
    };

    void syncCartWithCatalog();

    return () => {
      cancelled = true;
    };
  }, [items, replaceItems]);

  const handleCheckout = () => {
    if (!canCheckout) {
      return;
    }

    if (hasUnavailableItems) {
      replaceItems(checkoutItems);
      setSyncStatus((prev) => ({ ...prev, itemIssues: [] }));
    }

    if (!user) {
      router.push('/product/account?mode=login&redirectTo=/product/cart');
      return;
    }

    router.push('/product/account');
  };

  const handleRemoveUnavailable = () => {
    if (!hasUnavailableItems) {
      return;
    }

    replaceItems(checkoutItems);
    setSyncStatus((prev) => ({ ...prev, itemIssues: [] }));
  };

  return (
    <div className="storefront-page">
      <StorefrontHeader activeNav="cart" showSearch={false} />

      <main className="storefront-container" style={{ padding: '32px 0 0' }}>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="storefront-kicker">Cart</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your cart</h1>
          </div>
          <p className="storefront-muted text-sm">
            {items.length} item{items.length === 1 ? '' : 's'}
            {user ? ' - signed in' : ' - guest cart'}
          </p>
        </div>

        {syncStatus.loading ? (
          <div className="storefront-message mb-4 text-sm storefront-muted">Refreshing cart prices from live catalog...</div>
        ) : null}

        {!syncStatus.loading && syncStatus.updatedCount > 0 ? (
          <div className="storefront-message mb-4 text-sm">
            Updated {syncStatus.updatedCount} item{syncStatus.updatedCount === 1 ? '' : 's'} with latest product data.
          </div>
        ) : null}

        {syncStatus.error ? (
          <div className="storefront-message storefront-message-error mb-4 text-sm">{syncStatus.error}</div>
        ) : null}

        {hasUnavailableItems ? (
          <div className="storefront-message storefront-message-error mb-4 text-sm">
            {syncStatus.itemIssues.length} item{syncStatus.itemIssues.length === 1 ? '' : 's'} in your cart are no longer available.
            <button
              type="button"
              onClick={handleRemoveUnavailable}
              className="ml-3 inline-flex rounded-full border border-[#ffb8aa]/40 px-3 py-1 text-xs font-semibold text-[#ffe0da] transition hover:border-[#ffd0c6] hover:text-white"
            >
              Remove unavailable items
            </button>
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="storefront-panel p-8 text-center sm:p-14">
            <p className="text-xl font-medium text-white/85 sm:text-2xl">Your cart is empty.</p>
            <p className="mt-2 storefront-muted">Add products from the storefront to start building your order.</p>
            <Link
              href={PRODUCT_LIST_PATH}
              className="storefront-button storefront-button-primary mt-6 inline-flex"
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
                  className="storefront-panel grid grid-cols-[80px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[90px_minmax(0,1fr)] sm:gap-4 sm:p-4 md:grid-cols-[110px_minmax(0,1fr)_auto]"
                >
                  <img
                    src={product.imageUrl || `https://picsum.photos/seed/${product.slug ?? product.id}/800/800`}
                    alt={product.name}
                    className="h-[80px] w-[80px] rounded-xl object-cover sm:h-[90px] sm:w-[90px] md:h-[110px] md:w-[110px]"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-white">{product.name}</p>
                    <p className="storefront-muted mt-1 text-sm">{product.category ?? 'Catalog item'}</p>
                    {variant ? (
                      <p className="storefront-soft mt-1 text-xs">
                        {variant.color ?? 'Default'} / {variant.size ?? 'One size'}
                      </p>
                    ) : null}
                    {issueByItemId.has(id) ? (
                      <p className="mt-2 text-xs font-semibold text-[#ff9f8e]">{issueByItemId.get(id)?.message}</p>
                    ) : null}
                    <p className="mt-3 text-sm font-semibold text-white">
                      {formatCurrency(product.price)}
                    </p>

                    <div className="mt-3 flex w-fit items-center gap-2 rounded-xl border border-[var(--border)] bg-black/25 p-1">
                      <button
                        onClick={() => updateQuantity(id, quantity - 1)}
                        disabled={unavailableItemSet.has(id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-white transition hover:bg-white/10"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-white">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(id, quantity + 1)}
                        disabled={quantity >= 99 || unavailableItemSet.has(id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-white transition hover:bg-white/10"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-4 md:mt-0 md:flex-col md:items-end md:justify-between">
                    <p className="text-base font-semibold text-white">
                      {formatCurrency(product.price * quantity)}
                    </p>

                    <button
                      onClick={() => removeFromCart(id)}
                      className="storefront-soft rounded-lg px-2 py-1 text-xs transition hover:bg-[rgba(181,71,61,0.22)] hover:text-[#ffd7d2]"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="storefront-panel h-fit p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-semibold text-white">Order summary</h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="storefront-muted flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(checkoutSubtotal)}</span>
                </div>
                <div className="storefront-muted flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span>
                </div>
              </div>

              <div className="my-4 border-t border-white/10" />

              <div className="flex items-center justify-between text-base font-semibold text-white">
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!canCheckout}
                className="storefront-button storefront-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-45"
              >
                {hasUnavailableItems
                  ? 'Proceed with Available Items'
                  : user
                    ? 'Proceed to Checkout'
                    : 'Login to Continue'}
              </button>

              <Link href={PRODUCT_LIST_PATH} className="storefront-button storefront-button-secondary mt-3 w-full">
                Continue shopping
              </Link>

              <button
                onClick={clearCart}
                className="storefront-soft mt-4 w-full rounded-full border border-[var(--border)] py-2 text-xs font-semibold transition hover:border-[var(--border-strong)] hover:text-white"
              >
                Clear cart
              </button>

              {!user ? (
                <p className="storefront-purchase-note mt-4">
                  Checkout requires a signed-in storefront account. Your cart is preserved in this browser.
                </p>
              ) : null}
            </aside>
          </div>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
