import { Link, Outlet, useLocation } from 'react-router';
import { Store, Package, Warehouse, ShoppingCart, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

const navigation = [
  { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
  { name: 'My Shop', href: '/seller/shop', icon: Store },
  { name: 'Products', href: '/seller/products', icon: Package },
  { name: 'Inventory', href: '/seller/inventory', icon: Warehouse },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
];

export function SellerLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link to="/seller/dashboard" className="flex items-center gap-2">
            <Store className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-lg">Seller Center</h1>
              <p className="text-xs text-gray-500">Manage your shop</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
                           (item.href !== '/seller/dashboard' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = '/seller/login'}>
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
