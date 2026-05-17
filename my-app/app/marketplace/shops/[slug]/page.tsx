'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchShopDetail,
  fetchShopProducts,
  type Shop,
  type ShopProductItem,
} from '@/lib/marketplace';
import {
  ArrowLeftIcon,
  Badge,
  Card,
  CardContent,
  PackageIcon,
  StarIcon,
  buttonClassName,
  formatVnd,
  imageFallback,
} from '@/components/marketplace/MarketplaceUI';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ShopDetailPage({ params }: PageProps) {
  const [slug, setSlug] = useState('');
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<ShopProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((value) => setSlug(value.slug));
  }, [params]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const [shopData, productData] = await Promise.all([
        fetchShopDetail(slug),
        fetchShopProducts(slug, { limit: 48 }).catch(() => ({ items: [], total: 0, page: 1, limit: 48, shop: { id: '', name: '', slug } })),
      ]);
      setShop(shopData);
      setProducts(productData.items);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load shop';
      setError(message.includes('404') || message.toLowerCase().includes('not found') ? 'NOT_FOUND' : message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (error === 'NOT_FOUND') notFound();

  if (loading) {
    return (
      <div className="pb-12">
        <div className="h-48 animate-pulse bg-gray-100 md:h-64" />
        <div className="container mx-auto px-4">
          <div className="-mt-16 mb-8 h-40 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12">
          <div className="text-center">
            <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">Shop not found</h3>
            <p className="mb-4 text-gray-600">The shop you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/marketplace/shops" className={buttonClassName()}>Browse Shops</Link>
          </div>
        </Card>
      </div>
    );
  }

  const bannerUrl = shop.bannerUrl || imageFallback(`${shop.id}-banner`, 1200, 420);
  const logoUrl = shop.logoUrl || imageFallback(`${shop.id}-logo`, 200, 200);

  return (
    <div className="pb-12">
      <div className="relative h-48 overflow-hidden bg-gray-100 md:h-64">
        <Image
          src={bannerUrl}
          alt={shop.name}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="container mx-auto px-4">
        <Link href="/marketplace/shops" className={buttonClassName({ variant: 'ghost', className: 'mt-4 mb-4' })}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Shops
        </Link>

        <Card className="relative z-10 mb-8 -mt-16">
          <CardContent className="p-6">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <Image
                src={logoUrl}
                alt={shop.name}
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-bold">{shop.name}</h1>
                  {shop.status === 'approved' && <Badge variant="secondary">Verified Shop</Badge>}
                </div>
                <p className="mb-4 text-gray-600">{shop.description}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{shop.rating?.toFixed(1) || 'New'}</span>
                    <span className="text-gray-600">rating</span>
                  </div>
                  <div>
                    <span className="font-semibold">{shop.totalProducts ?? products.length}</span>
                    <span className="text-gray-600"> products</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-6 text-2xl font-bold">Products from this shop</h2>
          {products.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold">No products yet</h3>
                <p className="text-gray-600">This shop hasn&apos;t added any products yet.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Link key={product.id} href={`/marketplace/products/${product.slug}`} className="group">
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Image
                        src={product.imageUrl || imageFallback(product.id)}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-1 line-clamp-2 font-semibold transition-colors group-hover:text-blue-600">
                        {product.name}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-lg font-bold text-blue-600">{formatVnd(product.basePrice)}</p>
                        <div className="flex items-center gap-1 text-sm">
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>New</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
