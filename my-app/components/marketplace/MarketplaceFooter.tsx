import Link from 'next/link';
import { HelpIcon, MailIcon, ShieldIcon, StoreIcon } from './MarketplaceUI';

export function MarketplaceFooter() {
  return (
    <footer className="mt-auto border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <StoreIcon className="h-5 w-5" />
              Marketplace
            </div>
            <p className="text-sm text-gray-600">
              Your trusted online marketplace for quality products from verified sellers.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/marketplace" className="text-gray-600 hover:text-gray-900">Home</Link></li>
              <li><Link href="/marketplace/products" className="text-gray-600 hover:text-gray-900">Products</Link></li>
              <li><Link href="/marketplace/shops" className="text-gray-600 hover:text-gray-900">Shops</Link></li>
              <li><Link href="/marketplace/orders" className="text-gray-600 hover:text-gray-900">My Orders</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Seller</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/seller" className="text-gray-600 hover:text-gray-900">Seller Center</Link></li>
              <li><Link href="/seller/register" className="text-gray-600 hover:text-gray-900">Start Selling</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-600">
                <HelpIcon className="h-4 w-4" />
                Help Center
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <ShieldIcon className="h-4 w-4" />
                Buyer Protection
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <MailIcon className="h-4 w-4" />
                support@marketplace.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-gray-600">
          <p>&copy; 2026 Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
