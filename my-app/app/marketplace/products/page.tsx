'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fetchProducts,
  fetchCategories,
  type ProductCard,
  type Category,
} from '@/lib/marketplace';
import {
  ProductGrid,
  CategoryFilter,
  MarketplaceEmptyState,
  MarketplaceErrorState,
  MarketplaceLoadingState,
} from '@/components/marketplace';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const page = Number(searchParams.get('page') ?? 1);
  const limit = 24;
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? 'latest';

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({ page, limit, search, category, sort });
      setProducts(data.items);
      setTotal(data.total);
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((e as any).message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') {
        params.delete(k);
      } else {
        params.set(k, v);
      }
      if (k !== 'page') params.delete('page');
    }
    router.push(`/marketplace/products?${params.toString()}`);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        {/* Category pills */}
        {categories.length > 0 && (
          <CategoryFilter categories={categories} selectedSlug={category} />
        )}

        {/* Search + Sort row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search products..."
                defaultValue={search}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateParams({ search: (e.target as HTMLInputElement).value });
                  }
                }}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 ml-2"
              />
            </div>
          </div>

          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result info */}
      {!loading && !error && (
        <p className="text-sm text-gray-500">
          {total > 0
            ? `Showing ${products.length} of ${total} products`
            : `${total} products found`}
          {search && ` for "${search}"`}
          {category && ` in category`}
        </p>
      )}

      {/* Content */}
      {loading && <MarketplaceLoadingState rows={12} columns={5} />}

      {error && !loading && (
        <MarketplaceErrorState message={error} onRetry={loadProducts} />
      )}

      {!loading && !error && products.length === 0 && (
        <MarketplaceEmptyState
          title="No products found"
          description={search ? `No products match "${search}". Try a different search.` : 'No products available yet.'}
          action={
            <button
              onClick={() => router.push('/marketplace/products')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          }
        />
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <ProductGrid products={products} />
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button
                onClick={() => updateParams({ page: String(page - 1) })}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-6"><MarketplaceLoadingState rows={12} columns={5} /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
