import Link from 'next/link';

export function MarketplaceFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Advance Marketplace</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your trusted online marketplace for quality products from verified sellers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Marketplace</h3>
            <ul className="space-y-2">
              {[
                { label: 'Browse Products', href: '/marketplace/products' },
                { label: 'Browse Shops', href: '/marketplace/shops' },
                { label: 'My Cart', href: '/marketplace/cart' },
                { label: 'My Orders', href: '/marketplace/orders' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Seller</h3>
            <ul className="space-y-2">
              {[
                { label: 'Seller Center', href: '/seller' },
                { label: 'Register Shop', href: '/seller/register' },
                { label: 'Seller Login', href: '/seller/login' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2">
              {[
                { label: 'Admin Console', href: '/admin' },
                { label: 'Help Center', href: '#' },
                { label: 'Contact Us', href: '#' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Advance Technology Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Admin</Link>
            <Link href="/seller" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Seller</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
