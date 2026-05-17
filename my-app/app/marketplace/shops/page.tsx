'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchShops, type Shop } from '@/lib/marketplace';
import {
  Button,
  Card,
  SearchIcon,
  ShopCardLikeSample,
  StoreIcon,
} from '@/components/marketplace/MarketplaceUI';

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (query = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShops({ search: query, limit: 50 });
      setShops(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    load('');
  }, [load]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Shops</h1>

      <div className="mb-6">
        <form
          className="relative max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            load(searchQuery);
          }}
        >
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search shops..."
            className="h-9 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-1 pl-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <p className="mt-2 text-sm text-gray-600">
          {loading ? 'Loading shops...' : `${shops.length} shop${shops.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-64 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-12">
          <div className="text-center">
            <StoreIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">Unable to load shops</h3>
            <p className="mb-4 text-gray-600">{error}</p>
            <Button variant="outline" onClick={() => load(searchQuery)}>Try Again</Button>
          </div>
        </Card>
      ) : shops.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <StoreIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">No shops found</h3>
            <p className="text-gray-600">Try adjusting your search to find what you&apos;re looking for.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCardLikeSample key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
