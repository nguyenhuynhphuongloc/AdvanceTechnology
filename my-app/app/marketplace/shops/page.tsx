'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchShops, type Shop } from '@/lib/marketplace';
import { ShopCard } from '@/components/marketplace';
import {
  MarketplaceEmptyState,
  MarketplaceErrorState,
  MarketplaceLoadingState,
} from '@/components/marketplace';

export default function ShopsPage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShops({ search: searchQuery, limit: 50 });
      setShops(data);
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
      if (err.message?.includes('502') || err.message?.includes('Bad Gateway')) {
        setError('Shop service is currently unavailable. Please try again later.');
      } else {
        setError(err.message ?? 'Failed to load shops');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(search);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Shops</h1>
        <p className="text-sm text-gray-500 mb-4">Discover verified sellers and their products.</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 ml-2"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Content */}
      {loading && <MarketplaceLoadingState rows={6} columns={3} />}

      {error && !loading && (
        <MarketplaceErrorState message={error} onRetry={() => load(search)} />
      )}

      {!loading && !error && shops.length === 0 && (
        <MarketplaceEmptyState
          title="No shops found"
          description={search ? `No shops match "${search}".` : 'No shops available yet.'}
          action={
            search ? (
              <button
                onClick={() => { setSearch(''); load(''); }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Clear Search
              </button>
            ) : undefined
          }
        />
      )}

      {!loading && !error && shops.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
