'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Badge,
  CartIcon,
  HomeIcon,
  PackageIcon,
  SearchIcon,
  StoreIcon,
  UserIcon,
  buttonClassName,
  cn,
} from './MarketplaceUI';
import { clearMarketplaceSession, getMarketplaceToken } from '@/lib/marketplace/auth-api';

function getToken(): string | null {
  return getMarketplaceToken();
}

export function MarketplaceHeader() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchCartCount() {
      const token = getToken();
      setIsLoggedIn(Boolean(token));
      if (!token) return 0;
      const base = window.location.hostname === 'host.docker.internal'
        ? 'http://host.docker.internal:3000'
        : process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
      const res = await fetch(`${base}/api/v1/carts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return Array.isArray(data.items)
        ? data.items.reduce((sum: number, item: { quantity?: number }) => sum + Number(item.quantity || 0), 0)
        : 0;
    }

    fetchCartCount().then(setCartCount).catch(() => setCartCount(0));
  }, []);

  function handleLogout() {
    clearMarketplaceSession();
    setIsLoggedIn(false);
    setCartCount(0);
    window.location.href = '/marketplace';
  }

  function isActive(path: string) {
    return pathname === path;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  const navLinks = [
    { href: '/marketplace', label: 'Home', icon: <HomeIcon className="h-4 w-4 mr-2" /> },
    { href: '/marketplace/products', label: 'Products' },
    { href: '/marketplace/shops', label: 'Shops' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/marketplace" className="flex items-center gap-2 text-lg font-semibold">
            <StoreIcon className="h-6 w-6" />
            <span className="hidden sm:inline">Marketplace</span>
          </Link>

          <form onSubmit={handleSearch} className="max-w-xl flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search products or shops..."
                className="h-9 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-1 pl-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={buttonClassName({
                  variant: isActive(item.href) ? 'default' : 'ghost',
                  size: 'sm',
                })}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/marketplace/cart"
                  className={cn(buttonClassName({ variant: isActive('/marketplace/cart') ? 'default' : 'ghost', size: 'icon' }), 'relative')}
                  aria-label="Cart"
                >
                  <CartIcon />
                  {cartCount > 0 && (
                    <Badge variant="destructive" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs">
                      {cartCount > 99 ? '99+' : cartCount}
                    </Badge>
                  )}
                </Link>
                <Link
                  href="/marketplace/orders"
                  className={buttonClassName({ variant: isActive('/marketplace/orders') ? 'default' : 'ghost', size: 'icon' })}
                  aria-label="Orders"
                >
                  <PackageIcon />
                </Link>
                <Link
                  href="/marketplace/profile"
                  className={buttonClassName({ variant: isActive('/marketplace/profile') ? 'default' : 'ghost', size: 'icon' })}
                  aria-label="Profile"
                >
                  <UserIcon />
                </Link>
                <button type="button" onClick={handleLogout} className={buttonClassName({ variant: 'outline', size: 'sm' })}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/marketplace/login" className={buttonClassName({ variant: 'ghost', size: 'sm' })}>
                  Login
                </Link>
                <Link href="/marketplace/register" className={buttonClassName({ size: 'sm' })}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto pb-2 md:hidden">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={buttonClassName({
                variant: isActive(item.href) ? 'default' : 'ghost',
                size: 'sm',
              })}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
