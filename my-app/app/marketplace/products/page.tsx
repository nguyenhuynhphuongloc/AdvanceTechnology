'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fetchCategories,
  fetchProducts,
  type Category,
  type ProductCard,
} from '@/lib/marketplace';
import {
  Badge,
  Button,
  Card,
  ProductCardLikeSample,
  SearchIcon,
  SlidersIcon,
  buttonClassName,
} from '@/components/marketplace/MarketplaceUI';

const sortOptions = [
  { value: 'popular', label: 'Most Popular', apiValue: 'latest' },
  { value: 'rating', label: 'Highest Rated', apiValue: 'latest' },
  { value: 'price-low', label: 'Price: Low to High', apiValue: 'price-asc' },
  { value: 'price-high', label: 'Price: High to Low', apiValue: 'price-desc' },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sort') || 'popular';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const selectedSort = sortOptions.find((item) => item.value === sortBy)?.apiValue || 'latest';
      const [categoryData, productData] = await Promise.all([
        fetchCategories().catch(() => [] as Category[]),
        fetchProducts({
          limit: 48,
          search: searchQuery,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          sort: selectedSort,
        }),
      ]);
      setCategories(categoryData);
      setProducts(productData.items);
      setTotal(productData.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    load();
  }, [load]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === 'all') params.delete(key);
      else params.set(key, value);
    }
    router.push(`/marketplace/products${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Products</h1>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              const value = new FormData(e.currentTarget).get('search')?.toString() || '';
              updateParams({ search: value });
            }}
          >
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="search"
                placeholder="Search products..."
                className="h-9 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-1 pl-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                defaultValue={searchQuery}
              />
            </div>
          </form>

          <div className="relative">
            <SlidersIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <select
              className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 pl-9 text-sm text-gray-900 shadow-sm md:w-48"
              value={selectedCategory}
              onChange={(e) => updateParams({ category: e.target.value })}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <select
            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900 shadow-sm md:w-48"
            value={sortBy}
            onChange={(e) => updateParams({ sort: e.target.value })}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">
            {loading ? 'Loading products...' : `${total} product${total !== 1 ? 's' : ''} found`}
          </span>
          {selectedCategory !== 'all' && (
            <button type="button" onClick={() => updateParams({ category: null })}>
              <Badge variant="secondary" className="cursor-pointer">
                {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                <span className="ml-1">x</span>
              </Badge>
            </button>
          )}
          {searchQuery && (
            <button type="button" onClick={() => updateParams({ search: null })}>
              <Badge variant="secondary" className="cursor-pointer">
                &quot;{searchQuery}&quot;
                <span className="ml-1">x</span>
              </Badge>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-80 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-12">
          <div className="text-center">
            <SearchIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">Unable to load products</h3>
            <p className="mb-4 text-gray-600">{error}</p>
            <Button variant="outline" onClick={load}>Try Again</Button>
          </div>
        </Card>
      ) : products.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <SearchIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">No products found</h3>
            <p className="mb-4 text-gray-600">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <button className={buttonClassName({ variant: 'outline' })} onClick={() => router.push('/marketplace/products')}>
              Clear Filters
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCardLikeSample key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
