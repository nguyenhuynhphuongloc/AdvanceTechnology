'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSellerProduct } from '@/lib/seller/product-api';
import SellerPageHeader from '@/components/seller/SellerPageHeader';

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

function slugify(text: string) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
        .trim() || `product-${Date.now()}`;
}

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [sku, setSku] = useState('');
    const [description, setDescription] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Variants
    const [variants, setVariants] = useState([
        { sku: '', size: '', color: '', priceOverride: '', isActive: true },
    ]);

    const handleNameChange = (v: string) => {
        setName(v);
        if (!slug || slug === slugify(name)) {
            setSlug(slugify(v));
        }
    };

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

    const generateSku = () => {
        const base = sku || `SKU-${Date.now().toString(36).toUpperCase()}`;
        return base;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !basePrice) {
            setError('Name and price are required.');
            return;
        }

        setLoading(true);
        setError(null);

        const finalSlug = slug || slugify(name);
        const finalSku = sku || `SKU-${Date.now().toString(36).toUpperCase()}`;

        const payload: Parameters<typeof createSellerProduct>[0] = {
            name,
            slug: finalSlug,
            sku: finalSku,
            description,
            categoryId: categoryId || undefined,
            basePrice: parseFloat(basePrice),
            isActive,
            variants: variants
                .filter((v) => v.sku || v.size || v.color)
                .map((v) => ({
                    sku: v.sku || `${finalSku}-${variants.indexOf(v) + 1}`.toUpperCase(),
                    size: v.size || null,
                    color: v.color || null,
                    priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
                    isActive: v.isActive,
                })),
        };

        if (imageUrl) {
            payload.images = [
                { imageUrl, isMain: true, altText: name, sortOrder: 0 },
            ];
        }

        try {
            await createSellerProduct(payload);
            router.push('/seller/products');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <SellerPageHeader
                title="Add New Product"
                subtitle="Create a new listing for your shop"
                backHref="/seller/products"
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 space-y-5">
                    <h2 className="text-base font-black">Basic Information</h2>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g. Wireless Noise Cancelling Headphones"
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
                                placeholder="product-slug"
                                className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm font-mono focus:border-orange-500/50 outline-none transition-all"
                            />
                            <p className="text-[10px] text-zinc-600 mt-1">URL: /shop/{slug || 'slug'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">SKU</label>
                            <input
                                type="text"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                placeholder="Auto-generated if empty"
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
                            placeholder="Describe your product..."
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
                                placeholder="150000"
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
                        <span className="text-sm font-bold text-zinc-300">{isActive ? 'Active (published)' : 'Inactive (draft)'}</span>
                    </div>
                </div>

                {/* Image */}
                <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 space-y-4">
                    <h2 className="text-base font-black">Product Image</h2>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Image URL</label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm font-mono focus:border-orange-500/50 outline-none transition-all"
                        />
                    </div>
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
                                    <input
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                        placeholder="SKU-VAR1"
                                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs font-mono focus:border-orange-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Size</label>
                                    <input
                                        type="text"
                                        value={variant.size}
                                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                        placeholder="M"
                                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs focus:border-orange-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Color</label>
                                    <input
                                        type="text"
                                        value={variant.color}
                                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                        placeholder="Black"
                                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs focus:border-orange-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Price Override</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={variant.priceOverride}
                                        onChange={(e) => updateVariant(index, 'priceOverride', e.target.value)}
                                        placeholder="Base price"
                                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs focus:border-orange-500/50 outline-none transition-all"
                                    />
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

                <div className="flex items-center gap-4 pb-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating...
                            </span>
                        ) : 'Create Product'}
                    </button>
                    <Link
                        href="/seller/products"
                        className="px-6 py-3 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition-all"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
