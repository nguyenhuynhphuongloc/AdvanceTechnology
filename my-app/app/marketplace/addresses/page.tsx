import Link from 'next/link';
import { MarketplaceEmptyState } from '@/components/marketplace';

export default function AddressesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/marketplace/profile" className="text-sm text-orange-500 hover:underline">
          &larr; Back to Profile
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>

      <MarketplaceEmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        title="Address Management Coming Soon"
        description="Shipping address management features are being built."
        action={
          <Link
            href="/marketplace/profile"
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Profile
          </Link>
        }
      />
    </div>
  );
}
