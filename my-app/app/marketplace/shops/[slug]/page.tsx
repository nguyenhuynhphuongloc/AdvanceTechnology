'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  fetchShopDetail,
  fetchShopProducts,
  type Shop,
  type ShopProductItem,
} from '@/lib/marketplace';
import { MarketplaceErrorState, PriceText } from '@/components/marketplace';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ShopDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<ShopProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { params.then((p) => setSlug(p.slug)); }, [params]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const [s, p] = await Promise.all([
        fetchShopDetail(slug),
        fetchShopProducts(slug, { limit: 24 }).catch(() => ({ items: [], total: 0, shop: null, page: 1, limit: 24 })),
      ]);
      setShop(s);
      setProducts(p.items);
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
      if (err.message?.includes('404') || err.message?.includes('NotFound')) {
        setError('NOT_FOUND');
      } else if (err.message?.includes('502') || err.message?.includes('Bad Gateway')) {
        setError('Shop service is currently unavailable. Please try again later.');
      } else {
        setError(err.message ?? 'Failed to load shop');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  if (error === 'NOT_FOUND') notFound();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/marketplace/shops" className="text-sm text-orange-500 hover:underline mb-4 inline-block">
          &larr; Back to Shops
        </Link>
        <MarketplaceErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!shop) return null;

  const logoUrl = shop.logoUrl || `https://picsum.photos/seed/${shop.id}-banner/200/200`;

  const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Link href="/marketplace/shops" className="text-sm text-orange-500 hover:underline inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Shops
      </Link>

      {/* Shop header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-5">
          <img
            src={logoUrl}
            alt={shop.name}
            className="w-20 h-20 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{shop.name}</h1>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[shop.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {shop.status.charAt(0).toUpperCase() + shop.status.slice(1)}
              </span>
            </div>
            {shop.description && (
              <p className="text-sm text-gray-500 leading-relaxed mb-2">{shop.description}</p>
            )}
            {shop.totalProducts !== undefined && (
              <p className="text-sm text-gray-400">{shop.totalProducts} products</p>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Products{products.length > 0 ? ` (${products.length})` : ''}
        </h2>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">This shop has no products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/marketplace/products/${p.slug}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow transition-shadow"
              >
                <img
                  src={p.imageUrl || `https://picsum.photos/seed/${p.id}/400/400`}
                  alt={p.name}
                  className="w-full aspect-square object-cover bg-gray-100"
                />
                <div className="p-3">
                  <p className="text-sm text-gray-900 line-clamp-2 leading-snug mb-1">{p.name}</p>
                  <PriceText value={p.basePrice} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
