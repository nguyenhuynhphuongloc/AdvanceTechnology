'use client';

import { useAuth } from '@/lib/shopping/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/seller/login' || pathname === '/seller/register';

  useEffect(() => {
    // Skip redirect logic if already on auth pages
    if (isAuthPage) return;

    // If not logged in or not a seller, redirect
    if (!user) {
      router.push('/seller/login');
    } else if (user.role !== 'seller') {
      router.push('/');
    }
  }, [user, router, isAuthPage]);

  // If on login/register page, just render the content without sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!user || user.role !== 'seller') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-800 flex flex-col p-6 sticky top-0 h-screen">
        <div className="mb-10 px-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-xl group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Marketplace</p>
              <p className="text-xl font-black tracking-tight">Seller Hub</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem href="/seller/dashboard" label="Dashboard" icon="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm7 7v-5h4v5h-4zm2-15.586l7 7V20h-1v-7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v7H3v-7.586l7-7z" />
          <SidebarItem href="/seller/products" label="My Products" icon="M20 7h-4V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v3H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zM10 4h4v3h-4V4zM4 11h16v7H4v-7z" />
          <SidebarItem href="/seller/orders" label="Manage Orders" icon="M7 18c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2zM17 18c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2zM20 9.554V4.5a1 1 0 0 0-1-1H5.47L4.656 1.131A1 1 0 0 0 3.684 0H1v2h1.816l3.414 11.52A1.996 1.996 0 0 0 5 15v1a1 1 0 0 0 1 1h13v-2H7v-1h13a1 1 0 0 0 .958-.713l1.855-6.479a1 1 0 0 0-.813-1.254z" />
          <SidebarItem href="/seller/profile" label="Shop Profile" icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 py-3 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function SidebarItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all group"
    >
      <svg className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
        <path d={icon} />
      </svg>
      {label}
    </Link>
  );
}
