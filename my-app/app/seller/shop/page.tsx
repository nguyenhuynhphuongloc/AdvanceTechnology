/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSellerAuth } from '@/lib/seller/auth-context';
import { fetchMyShop, updateMyShop, createMyShop } from '@/lib/seller/shop-api';
import type { Shop } from '@/lib/seller/shop-api';
import SellerPageHeader from '@/components/seller/SellerPageHeader';
import SellerStatusBadge from '@/components/seller/SellerStatusBadge';
import SellerLoadingState from '@/components/seller/SellerLoadingState';

export default function SellerShopPage() {
    const { user } = useSellerAuth();
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [description, setDescription] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');

    const slugify = useCallback((text: string) =>
        text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 60)
            .replace(/^-+|-+$/g, ''),
    []);

    const handleNameChange = (newName: string) => {
        setName(newName);
        if (notFound) {
            setSlug(slugify(newName));
        }
    };

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        fetchMyShop()
            .then((data) => {
                setShop(data);
                setName(data.name || '');
                setSlug(data.slug || '');
                setLogoUrl(data.logoUrl || '');
                setBannerUrl(data.bannerUrl || '');
                setDescription(data.description || '');
                setContactEmail(data.contactEmail || '');
                setContactPhone(data.contactPhone || '');
                setAddress(data.address || '');
            })
            .catch((err) => {
                if (err.message === 'NO_SHOP') {
                    setNotFound(true);
                }
            })
            .finally(() => setLoading(false));
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const payload = {
            name,
            slug,
            logoUrl: logoUrl || null,
            bannerUrl: bannerUrl || null,
            description: description || null,
            contactEmail: contactEmail || null,
            contactPhone: contactPhone || null,
            address: address || null,
        };

        try {
            let updated: Shop;
            if (notFound) {
                updated = await createMyShop(payload as Parameters<typeof createMyShop>[0]);
                setNotFound(false);
            } else {
                updated = await updateMyShop(payload);
            }
            setShop(updated);
            setMessage({ type: 'success', text: 'Shop updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save shop' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <SellerLoadingState message="Loading shop..." />;

    return (
        <div>
            <SellerPageHeader
                title="My Shop"
                subtitle="Manage your shop information and settings"
            />

            {/* Shop status */}
            {shop && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        {shop.logoUrl ? (
                            <img src={shop.logoUrl} alt={shop.name} className="h-12 w-12 rounded-xl object-cover border border-gray-100" />
                        ) : (
                            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 text-lg font-black border border-orange-100">
                                {shop.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-gray-900">{shop.name}</p>
                            <p className="text-xs text-gray-400 font-mono">/{shop.slug}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {shop.rejectionReason && shop.status === 'rejected' && (
                            <span className="text-xs text-red-600 max-w-xs truncate hidden sm:block bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                                Lý do: {shop.rejectionReason}
                            </span>
                        )}
                        <SellerStatusBadge status={shop.status} />
                    </div>
                </div>
            )}

            {notFound && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                    <p className="text-amber-700 text-sm font-semibold">
                        You don&apos;t have a shop yet. Create one below.
                    </p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave}>
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
                        <h2 className="text-base font-bold text-gray-900">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Shop Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Your shop name"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Slug *</label>
                                <input
                                    type="text"
                                    required
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="your-shop-slug"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">marketplace.com/shop/{slug || 'your-slug'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your shop..."
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
                        <h2 className="text-base font-bold text-gray-900">Contact Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="contact@shop.com"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                                <input
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    placeholder="+84 123 456 789"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Address</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Main St, District 1, HCMC"
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
                        <h2 className="text-base font-bold text-gray-900">Shop Images</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Logo URL</label>
                                <input
                                    type="url"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                />
                                {logoUrl && (
                                    <div className="mt-2">
                                        <img src={logoUrl} alt="Logo preview" className="h-16 w-16 rounded-xl object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Banner URL</label>
                                <input
                                    type="url"
                                    value={bannerUrl}
                                    onChange={(e) => setBannerUrl(e.target.value)}
                                    placeholder="https://example.com/banner.png"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                />
                                {bannerUrl && (
                                    <div className="mt-2">
                                        <img src={bannerUrl} alt="Banner preview" className="h-16 w-full rounded-xl object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : notFound ? 'Create Shop' : 'Save Changes'}
                        </button>
                        {message && (
                            <p className={`text-sm font-semibold ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {message.text}
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
