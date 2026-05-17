'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  fetchProductDetail,
  fetchRelatedProducts,
  addCartItem,
  type ProductDetail,
  type ProductCard,
} from '@/lib/marketplace';
import {
  PriceText,
  QuantityStepper,
  MarketplaceErrorState,
} from '@/components/marketplace';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.split('; ').find((r) => r.startsWith('token='))?.split('=')[1] ?? null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string>('');
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<{ size: string; color: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const [p, r] = await Promise.all([
        fetchProductDetail(slug),
        fetchRelatedProducts(slug).catch(() => [] as ProductCard[]),
      ]);
      setProduct(p);
      setRelated(r);
      if (p.variants.length > 0) {
        setSelectedVariant({ size: p.variants[0].size, color: p.variants[0].color });
      }
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
      if (err.message?.includes('404') || err.message?.includes('NotFound') || err.message?.includes('not found')) {
        setError('NOT_FOUND');
      } else {
        setError(err.message ?? 'Failed to load product');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  if (error === 'NOT_FOUND') notFound();
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/marketplace/products" className="text-sm text-orange-500 hover:underline mb-4 inline-block">
          &larr; Back to Products
        </Link>
        <MarketplaceErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!product) return null;

  const selectedVariantData = product.variants.find(
    (v) => v.size === selectedVariant?.size && v.color === selectedVariant?.color,
  );
  const displayPrice = selectedVariantData?.price ?? product.basePrice;
  const mainImage = product.mainImage?.imageUrl || product.galleryImages[0]?.imageUrl || `https://picsum.photos/seed/${product.id}/600/600`;
  const productId = product.id;
  const productShopId = product.shopId;

  async function handleAddToCart() {
    if (!productShopId || !selectedVariantData) {
      setCartMsg({ type: 'error', text: 'Please select a variant first.' });
      return;
    }
    const token = getToken();
    if (!token) {
      setCartMsg({ type: 'error', text: 'Please log in to add items to cart.' });
      return;
    }
    setAddingToCart(true);
    setCartMsg(null);
    try {
      await addCartItem({
        variantId: selectedVariantData.id,
        productId,
        quantity,
        shopId: productShopId,
      });
      setCartMsg({ type: 'success', text: 'Added to cart successfully!' });
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCartMsg({ type: 'error', text: (e as any).message ?? 'Failed to add to cart.' });
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Link href="/marketplace/products" className="text-sm text-orange-500 hover:underline inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </Link>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Images */}
        <div className="space-y-3">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-xl bg-gray-100"
          />
          {product.galleryImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.galleryImages.map((img, i) => (
                <img
                  key={i}
                  src={img.imageUrl}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover bg-gray-100 border border-gray-200 cursor-pointer hover:border-orange-400 transition-colors shrink-0"
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-sm text-gray-400 mt-1">SKU: {product.sku}</p>
          </div>

          {/* Price */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Price</p>
            <PriceText value={displayPrice} className="text-3xl" />
          </div>

          {/* Variant selectors */}
          {product.availableSizes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedVariant((prev) => ({ ...prev!, size }))}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedVariant?.size === size
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.availableColors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {product.availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedVariant((prev) => ({ ...prev!, color }))}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedVariant?.color === color
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={99}
              className="w-36"
            />
          </div>

          {/* Add to cart */}
          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !product.shopId}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            {cartMsg && (
              <p className={`text-sm text-center font-medium ${cartMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {cartMsg.text}
              </p>
            )}
          </div>

          {/* Shop info */}
          {product.shopId && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sold by</p>
              <Link
                href={`/marketplace/shops/${product.shopId}`}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">
                    {(product.sellerName ?? 'S').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{product.sellerName ?? 'Shop'}</p>
                  <p className="text-xs text-gray-400">Visit shop</p>
                </div>
              </Link>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/marketplace/products/${p.slug}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow transition-shadow"
              >
                <img
                  src={p.imageUrl || `https://picsum.photos/seed/${p.id}/400/400`}
                  alt={p.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-3">
                  <p className="text-sm text-gray-900 line-clamp-2 leading-snug mb-1">{p.name}</p>
                  <PriceText value={p.basePrice} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
