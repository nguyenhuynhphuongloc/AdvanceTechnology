'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  addCartItem,
  fetchProductDetail,
  fetchRelatedProducts,
  type ProductCard,
  type ProductDetail,
} from '@/lib/marketplace';
import {
  ArrowLeftIcon,
  Badge,
  Button,
  Card,
  CardContent,
  CartIcon,
  PackageIcon,
  ProductCardLikeSample,
  StarIcon,
  StoreIcon,
  buttonClassName,
  formatVnd,
  imageFallback,
} from '@/components/marketplace/MarketplaceUI';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.split('; ').find((r) => r.startsWith('token='))?.split('=')[1] ?? null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [cartMsg, setCartMsg] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    params.then((value) => setSlug(value.slug));
  }, [params]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const [productData, relatedData] = await Promise.all([
        fetchProductDetail(slug),
        fetchRelatedProducts(slug).catch(() => [] as ProductCard[]),
      ]);
      setProduct(productData);
      setRelatedProducts(relatedData.slice(0, 4));
      setSelectedVariants({
        ...(productData.availableSizes[0] ? { Size: productData.availableSizes[0] } : {}),
        ...(productData.availableColors[0] ? { Color: productData.availableColors[0] } : {}),
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load product';
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg bg-gray-100" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="h-40 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12">
          <div className="text-center">
            <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">Product not found</h3>
            <p className="mb-4 text-gray-600">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/marketplace/products" className={buttonClassName()}>Browse Products</Link>
          </div>
        </Card>
      </div>
    );
  }

  const mainImage = product.mainImage?.imageUrl || product.galleryImages[0]?.imageUrl || imageFallback(product.id);
  const selectedVariant = product.variants.find((variant) => {
    const sizeMatches = !selectedVariants.Size || variant.size === selectedVariants.Size;
    const colorMatches = !selectedVariants.Color || variant.color === selectedVariants.Color;
    return sizeMatches && colorMatches;
  });
  const displayPrice = selectedVariant?.price || product.basePrice;
  const stock = 99;

  async function handleAddToCart() {
    if (!product?.shopId || !selectedVariant) {
      setCartMsg('Please select all product options');
      return;
    }
    if (!getToken()) {
      router.push(`/marketplace/login?next=${encodeURIComponent(`/marketplace/products/${slug}`)}`);
      return;
    }
    setAdding(true);
    setCartMsg(null);
    try {
      await addCartItem({
        productId: product.id,
        variantId: selectedVariant.id,
        shopId: product.shopId,
        quantity,
      });
      setCartMsg(`Added ${quantity} item(s) to cart`);
    } catch (e: unknown) {
      setCartMsg(e instanceof Error ? e.message : 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/marketplace/products" className={buttonClassName({ variant: 'ghost', className: 'mb-4' })}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Products
      </Link>

      <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            priority
            unoptimized
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">New</span>
              </div>
            </div>
            <div className="mb-4 text-3xl font-bold text-blue-600">{formatVnd(displayPrice)}</div>
          </div>

          <Card>
            <CardContent className="p-4">
              <Link
                href={product.shopId ? `/marketplace/shops/${product.shopId}` : '/marketplace/shops'}
                className="-m-4 flex items-center gap-3 rounded-lg p-4 transition-colors hover:bg-gray-50"
              >
                <StoreIcon className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Sold by</p>
                  <p className="font-semibold text-blue-600">{product.sellerName || 'Marketplace Seller'}</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {product.availableSizes.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-semibold">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedVariants.Size === size ? 'default' : 'outline'}
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, Size: size }))}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {product.availableColors.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-semibold">Color</label>
              <div className="flex flex-wrap gap-2">
                {product.availableColors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedVariants.Color === color ? 'default' : 'outline'}
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, Color: color }))}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">Quantity</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock}
                >
                  +
                </Button>
              </div>
              <span className="text-sm text-gray-600">{stock} available</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={adding || !selectedVariant}>
              <CartIcon className="h-5 w-5 mr-2" />
              {adding ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
          {cartMsg && (
            <Badge variant={cartMsg.toLowerCase().includes('added') ? 'secondary' : 'destructive'} className="w-full justify-center py-2">
              {cartMsg}
            </Badge>
          )}
        </div>
      </div>

      <Card className="mb-12">
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-bold">Product Description</h2>
          <p className="whitespace-pre-line text-gray-700">{product.description || 'No description available.'}</p>
        </CardContent>
      </Card>

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCardLikeSample key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
