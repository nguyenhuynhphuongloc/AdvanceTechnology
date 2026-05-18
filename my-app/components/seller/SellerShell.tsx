'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSellerAuth } from '@/lib/seller/auth-context';
import type { Shop } from '@/lib/seller/shop-api';

interface SellerShellProps {
    children: React.ReactNode;
    shop?: Shop | null;
}

const navItems = [
    {
        href: '/seller/dashboard',
        label: 'Dashboard',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
        href: '/seller/shop',
        label: 'My Shop',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
        href: '/seller/products',
        label: 'Products',
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
        href: '/seller/inventory',
        label: 'Inventory',
        icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    },
    {
        href: '/seller/orders',
        label: 'Orders',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    },
];

function SidebarNavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(href + '/');

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
        >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
            {label}
        </Link>
    );
}

export default function SellerShell({ children, shop }: SellerShellProps) {
    const { user, logout } = useSellerAuth();
    const pathname = usePathname();

    const isAuthPage = pathname === '/seller/login' || pathname === '/seller/register';
    if (isAuthPage) return <>{children}</>;

    const shopStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'suspended': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    const shopStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'Đã duyệt';
            case 'pending': return 'Chờ duyệt';
            case 'rejected': return 'Từ chối';
            case 'suspended': return 'Tạm ngưng';
            default: return status;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0a0e14] text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-zinc-800/60 sticky top-0 h-screen overflow-y-auto">
                {/* Logo */}
                <div className="px-5 pt-6 pb-4 border-b border-zinc-800/60">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-orange-500/20">
                            S
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-0.5">Marketplace</p>
                            <p className="text-base font-black tracking-tight leading-none">Seller Hub</p>
                        </div>
                    </Link>
                </div>

                {/* Shop status badge */}
                {shop && (
                    <div className="px-5 py-3 border-b border-zinc-800/60">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Shop</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white truncate pr-2">{shop.name}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex-shrink-0 ${shopStatusColor(shop.status)}`}>
                                {shopStatusLabel(shop.status)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <SidebarNavItem key={item.href} {...item} />
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-zinc-800/60">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 bg-zinc-800 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <p className="text-sm font-bold truncate">{user?.name}</p>
                            <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 py-2.5 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
