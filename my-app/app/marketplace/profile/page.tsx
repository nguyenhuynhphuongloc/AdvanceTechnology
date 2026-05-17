import Link from 'next/link';
import { MarketplaceEmptyState } from '@/components/marketplace';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <MarketplaceEmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        title="Profile Management Coming Soon"
        description="Profile editing features are being built. For now, manage your account through Seller Center."
        action={
          <div className="flex gap-3 justify-center">
            <Link
              href="/marketplace/addresses"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-orange-300 hover:text-orange-500 transition-colors"
            >
              Manage Addresses
            </Link>
            <Link
              href="/seller"
              className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              Seller Center
            </Link>
          </div>
        }
      />
    </div>
  );
}
