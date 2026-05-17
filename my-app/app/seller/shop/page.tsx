'use client';

import { useState, useEffect } from 'react';
import { useSellerAuth } from '@/lib/seller/auth-context';
import { fetchMyShop, updateMyShop, createMyShop } from '@/lib/seller/shop-api';
import type { Shop } from '@/lib/seller/shop-api';
import SellerPageHeader from '@/components/seller/SellerPageHeader';
import SellerStatusBadge from '@/components/seller/SellerStatusBadge';
import SellerLoadingState from '@/components/seller/SellerLoadingState';

export default function SellerShopPage() {
    const { user, isLoading } = useSellerAuth();
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
                <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {shop.logoUrl ? (
                            <img src={shop.logoUrl} alt={shop.name} className="h-12 w-12 rounded-xl object-cover" />
                        ) : (
                            <div className="h-12 w-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 text-lg font-black">
                                {shop.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-black text-white">{shop.name}</p>
                            <p className="text-xs text-zinc-500 font-mono">{shop.slug}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {shop.rejectionReason && shop.status === 'rejected' && (
                            <span className="text-xs text-red-400 max-w-xs truncate hidden sm:block">
                                Lý do: {shop.rejectionReason}
                            </span>
                        )}
                        <SellerStatusBadge status={shop.status} />
                    </div>
                </div>
            )}

            {notFound && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 mb-6">
                    <p className="text-amber-400 text-sm font-bold">
                        You don&apos;t have a shop yet. Create one below.
                    </p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave}>
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 space-y-5">
                        <h2 className="text-base font-black">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Shop Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your shop name"
                                    className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Slug *</label>
                                <input
                                    type="text"
                                    required
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="your-shop-slug"
                                    className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm font-mono focus:border-orange-500/50 outline-none transition-all"
                                />
                                <p className="text-[10px] text-zinc-600 mt-1">shopee-clone.vercel.app/shop/{slug || 'your-slug'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your shop..."
                                className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm resize-none focus:border-orange-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 space-y-5">
                        <h2 className="text-base font-black">Contact Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="contact@shop.com"
                                    className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    placeholder="+84 123 456 789"
                                    className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Address</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Main St, District 1, HCMC"
                                className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 space-y-5">
                        <h2 className="text-base font-black">Shop Images</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Logo URL</label>
                                <input
                                    type="url"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm font-mono focus:border-orange-500/50 outline-none transition-all"
                                />
                                {logoUrl && (
                                    <div className="mt-2">
                                        <img src={logoUrl} alt="Logo preview" className="h-16 w-16 rounded-xl object-cover border border-zinc-700" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Banner URL</label>
                                <input
                                    type="url"
                                    value={bannerUrl}
                                    onChange={(e) => setBannerUrl(e.target.value)}
                                    placeholder="https://example.com/banner.png"
                                    className="w-full bg-black border border-zinc-700/50 rounded-xl px-4 py-3 text-sm font-mono focus:border-orange-500/50 outline-none transition-all"
                                />
                                {bannerUrl && (
                                    <div className="mt-2">
                                        <img src={bannerUrl} alt="Banner preview" className="h-16 w-full rounded-xl object-cover border border-zinc-700" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : notFound ? 'Create Shop' : 'Save Changes'}
                        </button>
                        {message && (
                            <p className={`text-sm font-bold ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {message.text}
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
