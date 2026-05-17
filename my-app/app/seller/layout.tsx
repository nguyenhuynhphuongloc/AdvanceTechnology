'use client';

import { useSellerAuth } from '@/lib/seller/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyShop } from '@/lib/seller/shop-api';
import type { Shop } from '@/lib/seller/shop-api';
import { SellerAuthProvider } from '@/lib/seller/auth-context';

function SellerShell({ children }: { children: React.ReactNode }) {
    const { user, token, logout } = useSellerAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [shop, setShop] = useState<Shop | null>(null);
    const [shopLoading, setShopLoading] = useState(true);

    const isAuthPage = pathname === '/seller/login' || pathname === '/seller/register';

    useEffect(() => {
        if (isAuthPage) return;
        if (!user || !token) {
            router.push('/seller/login');
        } else if (user.role !== 'seller' && user.role !== 'admin') {
            // Customer or unknown role — redirect to home (not seller center)
            router.push('/');
        }
    }, [user, token, router, isAuthPage]);

    useEffect(() => {
        if (!user || !token) return;
        setShopLoading(true);
        fetchMyShop()
            .then((s) => { setShop(s); setShopLoading(false); })
            .catch(() => { setShop(null); setShopLoading(false); });
    }, [user, token]);

    const navItems = [
        { href: '/seller/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { href: '/seller/shop', label: 'My Shop', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { href: '/seller/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { href: '/seller/inventory', label: 'Inventory', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
        { href: '/seller/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    ];

    if (isAuthPage) {
        return <>{children}</>;
    }

    if (!user || !token) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="h-10 w-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const shopStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'suspended': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
        <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white sticky top-0 h-screen overflow-y-auto">
                {/* Logo */}
                <div className="px-5 pt-6 pb-4 border-b border-gray-100">
                    <Link href="/seller/dashboard" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20 flex-shrink-0">
                            S
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Marketplace</p>
                            <p className="text-base font-black tracking-tight leading-none text-gray-900">Seller Hub</p>
                        </div>
                    </Link>
                </div>

                {/* Shop status */}
                {shopLoading ? (
                    <div className="px-5 py-3 border-b border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shop</p>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                ) : shop ? (
                    <div className="px-5 py-3 border-b border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shop</p>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-gray-900 truncate">{shop.name}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex-shrink-0 ${shopStatusColor(shop.status)}`}>
                                {shopStatusLabel(shop.status)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="px-5 py-3 border-b border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shop</p>
                        <Link href="/seller/shop" className="text-xs text-orange-600 font-semibold hover:underline">
                            + Setup your shop
                        </Link>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    isActive
                                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                </svg>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 bg-orange-100 rounded-full flex items-center justify-center font-black text-sm text-orange-600 flex-shrink-0">
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                            <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    return (
        <SellerAuthProvider>
            <SellerShell>{children}</SellerShell>
        </SellerAuthProvider>
    );
}
