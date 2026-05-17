import { ShoppingCart, Search, User, Home, Store, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';
import { getCartItemCount } from '../../data/mockData';

export function Header() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/marketplace" className="flex items-center gap-2 font-semibold text-lg">
            <Store className="h-6 w-6" />
            <span className="hidden sm:inline">Marketplace</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products or shops..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={isActive('/marketplace') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/marketplace">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button
              variant={isActive('/marketplace/products') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/marketplace/products">Products</Link>
            </Button>
            <Button
              variant={isActive('/marketplace/shops') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/marketplace/shops">Shops</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant={isActive('/marketplace/cart') ? 'default' : 'ghost'}
              size="icon"
              asChild
              className="relative"
            >
              <Link to="/marketplace/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button
              variant={isActive('/marketplace/orders') ? 'default' : 'ghost'}
              size="icon"
              asChild
            >
              <Link to="/marketplace/orders">
                <Package className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant={isActive('/marketplace/profile') ? 'default' : 'ghost'}
              size="icon"
              asChild
            >
              <Link to="/marketplace/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        <nav className="flex md:hidden items-center gap-1 pb-2 overflow-x-auto">
          <Button
            variant={isActive('/marketplace') ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/marketplace">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
          </Button>
          <Button
            variant={isActive('/marketplace/products') ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/marketplace/products">Products</Link>
          </Button>
          <Button
            variant={isActive('/marketplace/shops') ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/marketplace/shops">Shops</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
