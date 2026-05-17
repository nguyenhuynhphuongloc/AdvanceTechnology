'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSellerProductDetail, updateSellerProduct, type SellerProduct } from '@/lib/seller/product-api';
import SellerPageHeader from '@/components/seller/SellerPageHeader';
import SellerStatusBadge from '@/components/seller/SellerStatusBadge';
import SellerLoadingState from '@/components/seller/SellerLoadingState';

const CATEGORIES = [
    { id: '', label: 'Select Category' },
    { id: 'cat-t-shirts', label: 'T-Shirts' },
    { id: 'cat-shirts', label: 'Shirts' },
    { id: 'cat-trousers', label: 'Trousers' },
    { id: 'cat-jackets', label: 'Jackets' },
    { id: 'cat-hoodies', label: 'Hoodies' },
    { id: 'cat-footwear', label: 'Footwear' },
    { id: 'cat-accessories', label: 'Accessories' },
    { id: 'cat-electronics', label: 'Electronics' },
    { id: 'cat-home', label: 'Home & Living' },
    { id: 'cat-sports', label: 'Sports' },
    { id: 'cat-books', label: 'Books' },
];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [product, setProduct] = useState<SellerProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [sku, setSku] = useState('');
    const [description, setDescription] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [variants, setVariants] = useState([
        { sku: '', size: '', color: '', priceOverride: '', isActive: true },
    ]);

    useEffect(() => {
        setLoading(true);
        fetchSellerProductDetail(id)
            .then((data) => {
                setProduct(data);
                setName(data.name || '');
                setSlug(data.slug || '');
                setSku(data.sku || '');
                setDescription(data.description || '');
                setBasePrice(String(data.basePrice || ''));
                setCategoryId(data.categoryId || '');
                setImageUrl(data.images?.[0]?.imageUrl || '');
                setIsActive(data.isActive ?? true);

                if (data.variants && data.variants.length > 0) {
                    setVariants(
                        data.variants.map((v) => ({
                            sku: v.sku,
                            size: v.size || '',
                            color: v.color || '',
                            priceOverride: v.priceOverride != null ? String(v.priceOverride) : '',
                            isActive: v.isActive,
                        }))
                    );
                }
            })
            .catch((err) => {
                setError(err.message || 'Failed to load product');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleSlugChange = (v: string) => {
        setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/ +/g, '-'));
    };

    const addVariant = () => {
        setVariants((prev) => [
            ...prev,
            { sku: '', size: '', color: '', priceOverride: '', isActive: true },
        ]);
    };

    const removeVariant = (index: number) => {
        setVariants((prev) => prev.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: string, value: string | boolean) => {
        setVariants((prev) =>
            prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg(null);

        const payload = {
            name,
            slug,
            sku,
            description,
            categoryId: categoryId || undefined,
            basePrice: parseFloat(basePrice),
            isActive,
            variants: variants
                .filter((v) => v.sku || v.size || v.color)
                .map((v) => ({
                    sku: v.sku,
                    size: v.size || null,
                    color: v.color || null,
                    priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
                    isActive: v.isActive,
                })),
        };

        if (imageUrl) {
            (payload as Record<string, unknown>).images = [
                { imageUrl, isMain: true, altText: name, sortOrder: 0 },
            ];
        }

        try {
            const updated = await updateSellerProduct(id, payload);
            setProduct(updated);
            setSuccessMsg('Product updated successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <SellerLoadingState message="Loading product..." />;

    if (error && !product) {
        return (
            <div className="text-center py-20">
                <p className="text-red-400 font-bold">{error}</p>
                <button onClick={() => router.push('/seller/products')} className="mt-4 text-sm font-bold text-orange-400">
                    Back to products
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <SellerPageHeader
                title="Edit Product"
                subtitle={product ? `"${product.name}"` : 'Update your product listing'}
                backHref="/seller/products"
            />

            {product && (
                <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                        )}
                        <div>
                            <p className="text-sm font-bold text-white">{product.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">SKU: {product.sku}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <SellerStatusBadge status={product.approvalStatus} />
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 space-y-5">
                    <h2 className="text-base font-black">Basic Information</h2>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Product Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm font-mono focus:border-orange-500/50 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">SKU</label>
                            <input
                                type="text"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm font-mono focus:border-orange-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm resize-none focus:border-orange-500/50 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Price (VND) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="1000"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                                className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition-all cursor-pointer"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-orange-500' : 'bg-zinc-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-sm font-bold text-zinc-300">{isActive ? 'Active (published)' : 'Inactive (hidden)'}</span>
                    </div>
                </div>

                {/* Image */}
                <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 space-y-4">
                    <h2 className="text-base font-black">Product Image</h2>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm font-mono focus:border-orange-500/50 outline-none transition-all"
                    />
                    {imageUrl && (
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-zinc-700">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        </div>
                    )}
                </div>

                {/* Variants */}
                <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-black">Variants</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="text-xs font-bold text-orange-400 hover:text-orange-300 uppercase tracking-wider transition-colors"
                        >
                            + Add Variant
                        </button>
                    </div>

                    {variants.map((variant, index) => (
                        <div key={index} className="bg-black/40 rounded-xl p-4 space-y-3 border border-zinc-800/50">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-zinc-500">Variant {index + 1}</p>
                                {variants.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="text-xs font-bold text-red-400 hover:text-red-300"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">SKU</label>
                                    <input type="text" value={variant.sku} onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                        placeholder="SKU-VAR1"
                                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs font-mono focus:border-orange-500/50 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Size</label>
                                    <input type="text" value={variant.size} onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                        placeholder="M"
                                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs focus:border-orange-500/50 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Color</label>
                                    <input type="text" value={variant.color} onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                        placeholder="Black"
                                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs focus:border-orange-500/50 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Price Override</label>
                                    <input type="number" min="0" value={variant.priceOverride} onChange={(e) => updateVariant(index, 'priceOverride', e.target.value)}
                                        placeholder="Base price"
                                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs focus:border-orange-500/50 outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <p className="text-red-400 text-sm font-bold">{error}</p>
                    </div>
                )}

                {successMsg && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                        <p className="text-emerald-400 text-sm font-bold">{successMsg}</p>
                    </div>
                )}

                <div className="flex items-center gap-4 pb-8">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/seller/products')}
                        className="px-6 py-3 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
