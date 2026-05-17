import Link from 'next/link';
import { fetchProducts, fetchCategories } from '@/lib/marketplace';
import { ProductGrid, CategoryFilter } from '@/components/marketplace';
import { MarketplaceEmptyState } from '@/components/marketplace/MarketplaceEmptyState';

export const dynamic = 'force-dynamic';

export default async function MarketplaceHomePage() {
  let categories: Awaited<ReturnType<typeof fetchCategories>> = [];
  let featuredProducts: Awaited<ReturnType<typeof fetchProducts>>['items'] = [];

  try {
    [categories, { items: featuredProducts }] = await Promise.all([
      fetchCategories(),
      fetchProducts({ limit: 12 }),
    ]);
  } catch {
    // show empty state on failure
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Discover Quality Products
        </h1>
        <p className="text-gray-500 mb-6">
          Shop from verified sellers with ease. Fast delivery, secure payment, and great deals.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/marketplace/products"
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Browse Products
          </Link>
          <Link
            href="/marketplace/shops"
            className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold border border-gray-300 rounded-lg transition-colors"
          >
            Browse Shops
          </Link>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Shop by Category</h2>
          <CategoryFilter categories={categories} selectedSlug={undefined} />
        </section>
      )}

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Featured Products</h2>
          <Link
            href="/marketplace/products"
            className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} />
        ) : (
          <MarketplaceEmptyState
            title="No products yet"
            description="Products from verified sellers will appear here."
            action={
              <Link
                href="/marketplace/products"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Browse Products
              </Link>
            }
          />
        )}
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: (
              <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            title: 'Shop Safely',
            desc: 'All sellers are verified for your security.',
          },
          {
            icon: (
              <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            ),
            title: 'Wide Selection',
            desc: 'Browse products across multiple categories.',
          },
          {
            icon: (
              <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            title: 'Secure Checkout',
            desc: 'Multiple payment methods available.',
          },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
            <div className="shrink-0">{item.icon}</div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
