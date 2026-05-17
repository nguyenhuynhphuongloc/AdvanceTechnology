'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSellerAuth } from '@/lib/seller/auth-context';
import { fetchSellerOrders } from '@/lib/seller/order-api';
import { fetchSellerProducts } from '@/lib/seller/product-api';
import { fetchSellerInventory } from '@/lib/seller/inventory-api';
import { fetchMyShop } from '@/lib/seller/shop-api';
import type { Shop } from '@/lib/seller/shop-api';
import SellerStatCard from '@/components/seller/SellerStatCard';
import SellerStatusBadge from '@/components/seller/SellerStatusBadge';

export default function SellerDashboardPage() {
    const { user } = useSellerAuth();
    const [shop, setShop] = useState<Shop | null>(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        lowStockItems: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const [shopData, productsData, ordersData, inventoryData] = await Promise.allSettled([
                fetchMyShop(),
                fetchSellerProducts({ limit: 1 }),
                fetchSellerOrders({ limit: 100 }),
                fetchSellerInventory({ limit: 1 }),
            ]);

            let totalProducts = 0;
            let totalOrders = 0;
            let pendingOrders = 0;
            let shippedOrders = 0;
            let lowStockItems = 0;
            let totalRevenue = 0;

            if (shopData.status === 'fulfilled') setShop(shopData.value);

            if (productsData.status === 'fulfilled') {
                totalProducts = productsData.value.total;
            }

            if (ordersData.status === 'fulfilled') {
                totalOrders = ordersData.value.total;
                pendingOrders = ordersData.value.items.filter(
                    (o) => o.status === 'pending' || o.status === 'confirmed'
                ).length;
                shippedOrders = ordersData.value.items.filter(
                    (o) => o.status === 'shipped' || o.status === 'delivered'
                ).length;
                totalRevenue = ordersData.value.items
                    .filter((o) => o.status !== 'cancelled')
                    .reduce((acc, o) => acc + o.shopTotal, 0);
            }

            if (inventoryData.status === 'fulfilled') {
                lowStockItems = inventoryData.value.items.filter(
                    (i) => i.status === 'low-stock' || i.status === 'out-of-stock'
                ).length;
            }

            setStats({
                totalProducts,
                totalOrders,
                pendingOrders,
                shippedOrders,
                lowStockItems,
                totalRevenue,
            });
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) loadDashboard();
    }, [user, loadDashboard]);

    const formatVND = (n: number) =>
        n >= 1_000_000
            ? `${(n / 1_000_000).toFixed(1)}M`
            : n >= 1_000
            ? `${(n / 1_000).toFixed(0)}K`
            : String(n);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Marketplace Portal</p>
                <h1 className="text-4xl font-black tracking-tight">
                    Welcome back, {user?.email?.split('@')[0]}!
                </h1>
                {shop && (
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-zinc-400 font-medium">{shop.name}</span>
                        <SellerStatusBadge status={shop.status} size="sm" />
                    </div>
                )}
            </div>

            {/* Stats */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-zinc-800 rounded w-24 mb-4" />
                            <div className="h-8 bg-zinc-800 rounded w-16" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <SellerStatCard
                        label="Total Products"
                        value={stats.totalProducts}
                        accent="default"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    />
                    <SellerStatCard
                        label="Total Orders"
                        value={stats.totalOrders}
                        accent="blue"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    />
                    <SellerStatCard
                        label="Pending Orders"
                        value={stats.pendingOrders}
                        accent="orange"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <SellerStatCard
                        label="Shipped / Delivered"
                        value={stats.shippedOrders}
                        accent="green"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    />
                    <SellerStatCard
                        label="Low Stock Items"
                        value={stats.lowStockItems}
                        accent={stats.lowStockItems > 0 ? 'red' : 'green'}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    />
                    <SellerStatCard
                        label="Revenue"
                        value={`${formatVND(stats.totalRevenue)}đ`}
                        accent="green"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 space-y-3">
                    <h2 className="text-lg font-black mb-4">Quick Actions</h2>
                    <QuickAction
                        href="/seller/products/new"
                        title="Add New Product"
                        description="Upload a new listing to your shop"
                    />
                    <QuickAction
                        href="/seller/orders"
                        title="Manage Orders"
                        description="Review and update order status"
                    />
                    <QuickAction
                        href="/seller/inventory"
                        title="Update Inventory"
                        description="Adjust stock levels and thresholds"
                    />
                    <QuickAction
                        href="/seller/shop"
                        title="Edit Shop Profile"
                        description="Update your shop information"
                    />
                </div>

                <div className="bg-zinc-900/40 border border-dashed border-zinc-800/60 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                    <div className="h-14 w-14 bg-zinc-800/80 rounded-2xl flex items-center justify-center text-zinc-600 mb-4">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-base mb-2">Getting Started</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mb-4">
                        Complete your shop profile and add products to start receiving orders.
                    </p>
                    <div className="flex gap-3 flex-wrap justify-center">
                        <Link href="/seller/shop" className="text-[10px] font-bold text-orange-400 uppercase tracking-wider border-b border-orange-400 pb-0.5 hover:text-orange-300 transition-colors">
                            Setup Shop
                        </Link>
                        <Link href="/seller/products/new" className="text-[10px] font-bold text-orange-400 uppercase tracking-wider border-b border-orange-400 pb-0.5 hover:text-orange-300 transition-colors">
                            Add Products
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickAction({ href, title, description }: { href: string; title: string; description: string }) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all group"
        >
            <div>
                <p className="font-bold text-sm text-white group-hover:translate-x-1 transition-transform">{title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
            </div>
            <svg className="w-5 h-5 text-zinc-700 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    );
}
