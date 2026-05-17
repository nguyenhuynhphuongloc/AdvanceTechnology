/* eslint-disable @next/next/no-img-element */
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
                        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm"
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
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none cursor-pointer"
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
                    <p className="text-red-600 font-semibold">{error}</p>
                    <button onClick={() => load()} className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700">
                        Try again
                    </button>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-xl">
                    <SellerEmptyState
                        title="No products yet"
                        description="Start selling by adding your first product listing."
                        action={
                            <Link href="/seller/products/new" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all">
                                + Add Product
                            </Link>
                        }
                    />
                </div>
            ) : (
                <>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        {['Product', 'SKU', 'Price', 'Status', 'Active', 'Created', 'Actions'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{product.name}</p>
                                                        {product.rejectionReason && product.approvalStatus === 'rejected' && (
                                                            <p className="text-[10px] text-red-600 truncate max-w-[200px]">
                                                                Reason: {product.rejectionReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs font-mono text-gray-400">{product.sku}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-sm font-bold text-gray-900">{product.basePrice.toLocaleString('vi-VN')}₫</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <SellerStatusBadge status={product.approvalStatus} />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                    product.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs text-gray-400">
                                                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={`/seller/products/edit/${product.id}`}
                                                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    {(product.approvalStatus === 'draft' || product.approvalStatus === 'rejected') && (
                                                        <button
                                                            onClick={() => handleSubmit(product.id)}
                                                            disabled={submittingId === product.id}
                                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-40"
                                                        >
                                                            {submittingId === product.id ? 'Submitting...' : 'Submit'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        disabled={deletingId === product.id}
                                                        className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors disabled:opacity-40"
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
                            <p className="text-xs text-gray-400 font-medium">
                                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => { const p = page - 1; setPage(p); load({ page: p }); }}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => { const p = page + 1; setPage(p); load({ page: p }); }}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all"
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
