'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchSellerInventory, updateInventoryStock, type InventoryItem } from '@/lib/seller/inventory-api';
import SellerPageHeader from '@/components/seller/SellerPageHeader';
import SellerStatCard from '@/components/seller/SellerStatCard';
import SellerStatusBadge from '@/components/seller/SellerStatusBadge';
import SellerEmptyState from '@/components/seller/SellerEmptyState';
import SellerLoadingState from '@/components/seller/SellerLoadingState';
import SellerActionBar from '@/components/seller/SellerActionBar';
import SellerModal from '@/components/seller/SellerModal';

export default function SellerInventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [editStock, setEditStock] = useState('');
    const [editThreshold, setEditThreshold] = useState('');
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const load = useCallback(async (opts: { page?: number; search?: string; lowStockOnly?: boolean } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchSellerInventory({
                page: opts.page ?? page,
                limit,
                search: opts.search !== undefined ? opts.search : search,
                lowStockOnly: opts.lowStockOnly !== undefined ? opts.lowStockOnly : lowStockOnly,
            });
            setItems(data.items ?? []);
            setTotal(data.total ?? 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    }, [page, search, lowStockOnly]);

    useEffect(() => { load(); }, [load]);

    const handleSearch = (v: string) => {
        setSearch(v);
        setPage(1);
        load({ search: v, lowStockOnly });
    };

    const handleLowStockToggle = () => {
        setLowStockOnly(!lowStockOnly);
        setPage(1);
        load({ search, lowStockOnly: !lowStockOnly });
    };

    const openEdit = (item: InventoryItem) => {
        setEditItem(item);
        setEditStock(String(item.stock));
        setEditThreshold(String(item.lowStockThreshold));
    };

    const handleSaveEdit = async () => {
        if (!editItem) return;
        setSaving(true);
        try {
            const updated = await updateInventoryStock(editItem.variantId, {
                stock: parseInt(editStock),
                lowStockThreshold: parseInt(editThreshold) || 0,
            });
            setItems((prev) => prev.map((i) => (i.variantId === updated.variantId ? updated : i)));
            setEditItem(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update stock');
        } finally {
            setSaving(false);
        }
    };

    const lowStockCount = items.filter((i) => i.status === 'low-stock' || i.status === 'out-of-stock').length;
    const totalStock = items.reduce((acc, i) => acc + i.availableStock, 0);
    const totalReserved = items.reduce((acc, i) => acc + i.reservedStock, 0);
    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <SellerPageHeader
                title="Inventory"
                subtitle="Manage stock levels for your product variants"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SellerStatCard
                    label="Total SKUs"
                    value={items.length}
                    accent="default"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                />
                <SellerStatCard
                    label="Available Stock"
                    value={totalStock.toLocaleString()}
                    accent="green"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                />
                <SellerStatCard
                    label="Reserved"
                    value={totalReserved.toLocaleString()}
                    accent="orange"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                />
                <SellerStatCard
                    label="Low Stock SKUs"
                    value={lowStockCount}
                    accent="red"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
            </div>

            {/* Action bar */}
            <SellerActionBar
                search={{ value: search, onChange: handleSearch, placeholder: 'Search SKU, product ID...' }}
                filters={
                    <button
                        onClick={handleLowStockToggle}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            lowStockOnly
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/60'
                        }`}
                    >
                        Low Stock Only
                    </button>
                }
            />

            {/* Table */}
            {loading ? (
                <SellerLoadingState />
            ) : error ? (
                <div className="py-20 text-center">
                    <p className="text-red-400 font-bold">{error}</p>
                    <button onClick={() => load()} className="mt-4 text-sm font-bold text-orange-400 hover:text-orange-300">
                        Try again
                    </button>
                </div>
            ) : items.length === 0 ? (
                <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl">
                    <SellerEmptyState
                        title="No inventory items"
                        description={lowStockOnly ? 'No low stock items found.' : 'Your inventory will appear here once you add products.'}
                    />
                </div>
            ) : (
                <>
                    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-800/60">
                                        {['SKU', 'Product ID', 'Variant ID', 'Stock', 'Reserved', 'Available', 'Threshold', 'Status', 'Actions'].map((h) => (
                                            <th key={h} className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-zinc-800/40 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs font-mono font-bold text-zinc-300">{item.sku}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs font-mono text-zinc-500">{item.productId.slice(0, 8)}...</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs font-mono text-zinc-500">{item.variantId.slice(0, 8)}...</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-sm font-bold text-white">{item.stock}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-sm font-bold text-zinc-400">{item.reservedStock}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`text-sm font-black ${item.availableStock <= 0 ? 'text-red-400' : item.availableStock <= item.lowStockThreshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    {item.availableStock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs text-zinc-500">{item.lowStockThreshold}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <SellerStatusBadge status={item.status} size="sm" />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="text-[10px] font-bold text-orange-400 hover:text-orange-300 uppercase tracking-wider transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-zinc-500 font-medium">
                                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => { const p = page - 1; setPage(p); load({ page: p }); }}
                                    className="px-4 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-zinc-700/60 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => { const p = page + 1; setPage(p); load({ page: p }); }}
                                    className="px-4 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-zinc-700/60 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Edit Stock Modal */}
            <SellerModal
                open={!!editItem}
                onClose={() => setEditItem(null)}
                title={`Edit Stock — ${editItem?.sku}`}
                footer={
                    <>
                        <button onClick={() => setEditItem(null)} className="px-5 py-2.5 rounded-xl bg-zinc-800 text-sm font-bold hover:bg-zinc-700 transition-all">Cancel</button>
                        <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Stock</label>
                        <input
                            type="number"
                            min="0"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Low Stock Threshold</label>
                        <input
                            type="number"
                            min="0"
                            value={editThreshold}
                            onChange={(e) => setEditThreshold(e.target.value)}
                            className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition-all"
                        />
                        <p className="text-[10px] text-zinc-600 mt-1">Alert when available stock falls below this number</p>
                    </div>
                    {editItem && (
                        <div className="bg-black/40 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Reserved</span>
                                <span className="font-bold">{editItem.reservedStock}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">New Available</span>
                                <span className={`font-black ${Math.max(0, parseInt(editStock) - editItem.reservedStock) <= parseInt(editThreshold) ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {Math.max(0, parseInt(editStock || '0') - editItem.reservedStock)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </SellerModal>
        </div>
    );
}
