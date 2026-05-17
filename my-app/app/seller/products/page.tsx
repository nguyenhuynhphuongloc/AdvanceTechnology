'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchSellerProducts, deleteSellerProduct, submitSellerProduct, type SellerProduct } from '@/lib/seller/product-api';
import SellerPageHeader from '@/components/seller/SellerPageHeader';
import SellerStatusBadge from '@/components/seller/SellerStatusBadge';
import SellerEmptyState from '@/components/seller/SellerEmptyState';
import SellerLoadingState from '@/components/seller/SellerLoadingState';
import SellerActionBar from '@/components/seller/SellerActionBar';

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'hidden', label: 'Hidden' },
];

export default function SellerProductsPage() {
    const [products, setProducts] = useState<SellerProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const limit = 20;

    const load = useCallback(async (opts: {
        page?: number;
        search?: string;
        status?: string;
    } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchSellerProducts({
                page: opts.page ?? page,
                limit,
                search: opts.search !== undefined ? opts.search : search,
                status: opts.status !== undefined ? opts.status : statusFilter,
            });
            setProducts(data.items ?? []);
            setTotal(data.total ?? 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleSearch = (v: string) => {
        setSearch(v);
        setPage(1);
        load({ search: v });
    };

    const handleStatusChange = (v: string) => {
        setStatusFilter(v);
        setPage(1);
        load({ status: v });
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete product "${name}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await deleteSellerProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete product');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (id: string) => {
        if (!confirm('Submit this product for approval?')) return;
        setSubmittingId(id);
        try {
            const updated = await submitSellerProduct(id);
            setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to submit product');
        } finally {
            setSubmittingId(null);
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <SellerPageHeader
                title="Products"
                subtitle="Manage your product listings and inventory"
                action={
                    <Link
                        href="/seller/products/new"
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-orange-500/20"
                    >
                        + Add Product
                    </Link>
                }
            />

            <SellerActionBar
                search={{ value: search, onChange: handleSearch, placeholder: 'Search by name or SKU...' }}
                filters={
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-300 focus:border-orange-500/50 outline-none cursor-pointer"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                }
            />

            {loading ? (
                <SellerLoadingState />
            ) : error ? (
                <div className="py-20 text-center">
                    <p className="text-red-400 font-bold">{error}</p>
                    <button onClick={() => load()} className="mt-4 text-sm font-bold text-orange-400 hover:text-orange-300">
                        Try again
                    </button>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl">
                    <SellerEmptyState
                        title="No products yet"
                        description="Start selling by adding your first product listing."
                        action={
                            <Link href="/seller/products/new" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-orange-500/20">
                                + Add Product
                            </Link>
                        }
                    />
                </div>
            ) : (
                <>
                    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-800/60">
                                        {['Product', 'SKU', 'Price', 'Status', 'Active', 'Created', 'Actions'].map((h) => (
                                            <th key={h} className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b border-zinc-800/40 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No img</div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-white truncate max-w-[200px]">{product.name}</p>
                                                        {product.rejectionReason && product.approvalStatus === 'rejected' && (
                                                            <p className="text-[10px] text-red-400 truncate max-w-[200px]">
                                                                Reason: {product.rejectionReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs font-mono text-zinc-400">{product.sku}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-sm font-black text-white">{product.basePrice.toLocaleString('vi-VN')}đ</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <SellerStatusBadge status={product.approvalStatus} />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    product.isActive
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                                }`}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs text-zinc-500">
                                                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={`/seller/products/edit/${product.id}`}
                                                        className="text-[10px] font-bold text-orange-400 hover:text-orange-300 uppercase tracking-wider transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    {(product.approvalStatus === 'draft' || product.approvalStatus === 'rejected') && (
                                                        <button
                                                            onClick={() => handleSubmit(product.id)}
                                                            disabled={submittingId === product.id}
                                                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors disabled:opacity-50"
                                                        >
                                                            {submittingId === product.id ? 'Submitting...' : 'Submit'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        disabled={deletingId === product.id}
                                                        className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider transition-colors disabled:opacity-50"
                                                    >
                                                        {deletingId === product.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

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
        </div>
    );
}
