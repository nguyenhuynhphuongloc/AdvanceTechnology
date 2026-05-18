import Link from 'next/link';
import Image from 'next/image';
import {
  fetchCategories,
  fetchProducts,
  fetchShops,
  type Category,
  type ProductCard,
  type Shop,
} from '@/lib/marketplace';
import {
  ArrowRightIcon,
  Card,
  CardContent,
  ShopCardLikeSample,
  StarIcon,
  TrendIcon,
  buttonClassName,
  formatVnd,
  imageFallback,
} from '@/components/marketplace/MarketplaceUI';

export const dynamic = 'force-dynamic';

async function loadMarketplaceHomeData() {
  const [productsResult, shopsResult, categoriesResult] = await Promise.allSettled([
    fetchProducts({ limit: 4 }),
    fetchShops({ limit: 3 }),
    fetchCategories(),
  ]);

  return {
    featuredProducts: productsResult.status === 'fulfilled' ? productsResult.value.items : [],
    featuredShops: shopsResult.status === 'fulfilled' ? shopsResult.value : [],
    categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value : [],
  };
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link key={category.id} href={`/marketplace/products?category=${category.slug}`} className="group">
      <Card className="transition-shadow hover:shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 transition-colors group-hover:from-blue-200 group-hover:to-indigo-200">
            <TrendIcon className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium">{category.name}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProductCardExact({ product }: { product: ProductCard }) {
  const imageUrl = product.imageUrl || imageFallback(product.id);

  return (
    <Link key={product.id} href={`/marketplace/products/${product.slug}`} className="group">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
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
          <p className="mb-2 text-sm text-gray-600">{product.sellerName || 'Marketplace Seller'}</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-blue-600">{formatVnd(product.basePrice)}</p>
            <div className="flex items-center gap-1 text-sm">
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>New</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ShopCardExact({ shop }: { shop: Shop }) {
  return <ShopCardLikeSample shop={shop} />;
}

export default async function MarketplaceHomePage() {
  const { featuredProducts, featuredShops, categories } = await loadMarketplaceHomeData();

  return (
    <div className="space-y-12 pb-12">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Discover Amazing Products
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Shop from thousands of trusted sellers and find exactly what you&apos;re looking for.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/marketplace/products" className={buttonClassName({ size: 'lg' })}>
                Browse Products
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/marketplace/shops" className={buttonClassName({ size: 'lg', variant: 'outline' })}>
                Explore Shops
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/marketplace/products" className={buttonClassName({ variant: 'ghost' })}>
            View All
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCardExact key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Shops</h2>
          <Link href="/marketplace/shops" className={buttonClassName({ variant: 'ghost' })}>
            View All
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredShops.map((shop) => (
            <ShopCardExact key={shop.id} shop={shop} />
          ))}
        </div>
      </section>
    </div>
  );
}
