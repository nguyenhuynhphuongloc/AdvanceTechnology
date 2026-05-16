'use client';

import { useAuth } from '@/lib/shopping/auth-context';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAdminOrders } from '@/lib/shopping/order-api';

type SellerProductSummary = {
  sellerEmail?: string;
};

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    sales: 0,
    revenue: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const allProducts = JSON.parse(localStorage.getItem('seller_products') || '[]') as SellerProductSummary[];
        const sellerProducts = allProducts.filter((p) => p.sellerEmail === user?.email);
        
        const ordersData = await fetchAdminOrders();
        const successfulOrders = ordersData.items.filter(o => o.status !== 'failed' && o.status !== 'cancelled' && o.status !== 'pending');
        const revenue = successfulOrders.reduce((acc, o) => acc + o.totalAmount, 0);

        setStats({
          products: sellerProducts.length,
          sales: successfulOrders.length,
          revenue: revenue,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12">
        <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Marketplace Portal</p>
        <h1 className="text-5xl font-black tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard label="Total Products" value={stats.products} icon="M20 7h-4V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v3H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2z" />
        <StatCard label="Total Sales" value={stats.sales} icon="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 15l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7z" />
        <StatCard label="Revenue" value={`$${stats.revenue}`} icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" color="bg-green-500/10 text-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <QuickAction href="/seller/products/new" title="Add New Product" description="Upload a new item to your storefront" />
            <QuickAction href="/seller/orders" title="Manage Orders" description="Review and approve customer orders" />
            <QuickAction href="/seller/profile" title="Configure Payments" description="Link your Stripe account to receive payouts" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 flex flex-col items-center justify-center text-center">
           <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-600">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
           </div>
           <h3 className="font-bold text-lg mb-2">Getting Started</h3>
           <p className="text-zinc-500 text-sm max-w-xs mb-6">Complete your shop profile and add at least 3 products to start appearing in search results.</p>
           <button className="text-white font-bold text-sm border-b-2 border-white pb-1">View Onboarding Guide</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = "bg-zinc-950 text-white",
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-white/10 transition-all group">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d={icon} /></svg>
      </div>
      <p className="text-zinc-500 font-bold text-sm mb-1 uppercase tracking-wider">{label}</p>
      <h2 className="!text-zinc-950 text-4xl font-black tracking-tight">{value}</h2>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group bg-black border border-zinc-800 rounded-2xl p-5 hover:border-white transition-all flex items-center justify-between">
      <div>
        <h4 className="font-bold text-white group-hover:translate-x-1 transition-transform">{title}</h4>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <svg className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
    </Link>
  );
}
