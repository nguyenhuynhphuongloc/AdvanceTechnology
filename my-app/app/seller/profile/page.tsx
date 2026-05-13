'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/shopping/auth-context';

export default function SellerProfilePage() {
  const { user } = useAuth();
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [stripeId, setStripeId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load existing profile from localStorage
    const savedProfiles = JSON.parse(localStorage.getItem('seller_profiles') || '{}');
    if (user && savedProfiles[user.email]) {
      const profile = savedProfiles[user.email];
      setShopName(profile.shopName || '');
      setAddress(profile.address || '');
      setStripeId(profile.stripeId || '');
    } else if (user) {
      // Fallback to registration data
      setShopName(user.shopName || '');
      setAddress(user.address || '');
      setStripeId(user.stripeCard || '');
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    setTimeout(() => {
      const savedProfiles = JSON.parse(localStorage.getItem('seller_profiles') || '{}');
      if (user) {
        savedProfiles[user.email] = { shopName, address, stripeId };
        localStorage.setItem('seller_profiles', JSON.stringify(savedProfiles));
      }
      setIsSaving(false);
      setMessage('Profile updated successfully!');
    }, 800);
  };

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2">Shop Profile</h1>
        <p className="text-zinc-500 font-medium text-lg">Manage your business information and payment details.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Shop Name</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Ex: Acme Boutique"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Shop Address</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your physical store or business address"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none transition-all resize-none"
              />
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-[#635BFF] rounded-lg flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.945 10.158l-1.34 5.568h2.645l-1.213 5.041L19.2 12.352h-2.656l1.213-5.041zm-6.195-2.079V5.04l5.25 5.118v3.039l-5.25-5.118zm0 5.118v3.039l-5.25-5.118V8.079l5.25 5.118z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Stripe Account ID</label>
                  <p className="text-[10px] text-zinc-600 font-bold">Required for processing payouts</p>
                </div>
              </div>
              <input
                type="text"
                required
                value={stripeId}
                onChange={(e) => setStripeId(e.target.value)}
                placeholder="acct_xxxxxxxxxxxx"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-mono focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`min-w-[160px] cursor-pointer rounded-2xl bg-white py-4 text-sm font-black text-black hover:bg-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}
            >
              {isSaving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-black"></div>
              ) : 'Save Changes'}
            </button>
            
            {message && (
              <p className="text-sm font-bold text-green-500 animate-in fade-in slide-in-from-left-2">
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
