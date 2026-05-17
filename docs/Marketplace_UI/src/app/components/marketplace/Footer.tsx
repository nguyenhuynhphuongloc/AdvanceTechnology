import { Link } from 'react-router';
import { Store, ShieldCheck, HelpCircle, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-semibold text-lg mb-4">
              <Store className="h-5 w-5" />
              Marketplace
            </div>
            <p className="text-sm text-gray-600">
              Your trusted online marketplace for quality products from verified sellers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/marketplace" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/marketplace/products" className="text-gray-600 hover:text-gray-900">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/marketplace/shops" className="text-gray-600 hover:text-gray-900">
                  Shops
                </Link>
              </li>
              <li>
                <Link to="/marketplace/orders" className="text-gray-600 hover:text-gray-900">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Seller</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/seller" className="text-gray-600 hover:text-gray-900">
                  Seller Center
                </Link>
              </li>
              <li>
                <Link to="/seller/register" className="text-gray-600 hover:text-gray-900">
                  Start Selling
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-600">
                <HelpCircle className="h-4 w-4" />
                Help Center
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <ShieldCheck className="h-4 w-4" />
                Buyer Protection
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                support@marketplace.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-600">
          <p>&copy; 2026 Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
