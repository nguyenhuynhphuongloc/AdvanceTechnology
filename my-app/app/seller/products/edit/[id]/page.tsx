/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSellerProductDetail, updateSellerProduct, uploadSellerProductImage, type SellerProduct } from '@/lib/seller/product-api';
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
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (file: File) => {
        setImageUploading(true);
        setError(null);
        try {
            const result = await uploadSellerProductImage(file);
            setImageUrl(result.imageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload image');
        } finally {
            setImageUploading(false);
        }
    };
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
                            isActive: v.isActive ?? true,
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
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover border border-gray-100" />
                        )}
                        <div>
                            <p className="text-sm font-bold text-gray-900">{product.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">SKU: {product.sku}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <SellerStatusBadge status={product.approvalStatus} />
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900">Basic Information</h2>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">SKU</label>
                            <input
                                type="text"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price (VND) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="1000"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all cursor-pointer"
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-orange-500' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-sm font-semibold text-gray-700">{isActive ? 'Active (published)' : 'Inactive (hidden)'}</span>
                    </div>
                </div>

                {/* Image */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900">Product Image</h2>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                        }}
                    />
                    {imageUrl ? (
                        <div className="flex items-start gap-4">
                            <img
                                src={imageUrl}
                                alt="Product preview"
                                className="h-28 w-28 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="flex flex-col gap-2 pt-1">
                                <p className="text-xs text-gray-500 font-mono break-all">{imageUrl}</p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={imageUploading}
                                    className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors disabled:opacity-50"
                                >
                                    {imageUploading ? 'Uploading...' : 'Replace image'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageUrl('')}
                                    className="text-xs font-semibold text-red-400 hover:text-red-500 transition-colors"
                                >
                                    Remove image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={imageUploading}
                            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 hover:border-orange-400 hover:bg-orange-50 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {imageUploading ? (
                                <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                            <span className="text-sm font-semibold text-gray-500">
                                {imageUploading ? 'Uploading to Cloudinary...' : 'Click to upload image'}
                            </span>
                            <span className="text-xs text-gray-400">JPG, PNG, WEBP · max 5 MB</span>
                        </button>
                    )}
                </div>

                {/* Variants */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900">Variants</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="text-xs font-semibold text-orange-500 hover:text-orange-600 uppercase tracking-wider transition-colors"
                        >
                            + Add Variant
                        </button>
                    </div>

                    {variants.map((variant, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-500">Variant {index + 1}</p>
                                {variants.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="text-xs font-semibold text-red-400 hover:text-red-500"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">SKU</label>
                                    <input type="text" value={variant.sku} onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                        placeholder="SKU-VAR1"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:border-orange-400 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Size</label>
                                    <input type="text" value={variant.size} onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                        placeholder="M"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-orange-400 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color</label>
                                    <input type="text" value={variant.color} onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                        placeholder="Black"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-orange-400 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Price Override</label>
                                    <input type="number" min="0" value={variant.priceOverride} onChange={(e) => updateVariant(index, 'priceOverride', e.target.value)}
                                        placeholder="Base price"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-orange-400 outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-red-600 text-sm font-semibold">{error}</p>
                    </div>
                )}

                {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <p className="text-emerald-700 text-sm font-semibold">{successMsg}</p>
                    </div>
                )}

                <div className="flex items-center gap-4 pb-8">
                    <button
                        type="submit"
                        disabled={saving || imageUploading}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 shadow-sm"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/seller/products')}
                        className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-500 hover:text-gray-700 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
