'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSellerAuth } from '@/lib/seller/auth-context';
import { createMyShop } from '@/lib/seller/shop-api';

export default function SellerRegisterPage() {
  const { register, isLoggedIn, isLoading } = useSellerAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopCreationFailed, setShopCreationFailed] = useState(false);
  const [shopCreationError, setShopCreationError] = useState('');

  // Step 1 fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 fields
  const [businessName, setBusinessName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push('/seller/dashboard');
    }
  }, [isLoading, isLoggedIn, router]);

  // Auto-generate slug from shopName
  useEffect(() => {
    if (shopName) {
      const slug = shopName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50);
      setShopSlug(slug);
    }
  }, [shopName]);

  const validateStep1 = (): string | null => {
    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!fullName.trim()) return 'Full name is required.';
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!businessName.trim()) return 'Business name is required.';
    if (!shopName.trim()) return 'Shop name is required.';
    if (!shopSlug.trim()) return 'Shop URL slug is required.';
    if (!/^[a-z0-9-]+$/.test(shopSlug)) return 'Shop URL can only contain lowercase letters, numbers, and hyphens.';
    if (shopSlug.length < 3) return 'Shop URL must be at least 3 characters.';
    if (!address.trim()) return 'Business address is required.';
    return null;
  };

  const handleNext = () => {
    setError('');
    const err = validateStep1();
    if (err) { setError(err); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const validationError = validateStep2();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Register seller account
      await register(email, password, fullName);

      // 2. Try to create shop (may fail if store-service is down)
      try {
        await createMyShop({
          name: shopName,
          slug: shopSlug,
          description: description || undefined,
          contactEmail: email,
          contactPhone: phone || undefined,
          address: address,
        });
        router.push('/seller/dashboard');
      } catch (shopErr) {
        // Store-service likely down — still account was created
        setShopCreationFailed(true);
        setShopCreationError(shopErr instanceof Error ? shopErr.message : 'Shop creation failed');
        // Still redirect but user needs to complete shop setup
        router.push('/seller/shop');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-10 w-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 font-black text-xl shadow-lg">
              S
            </div>
            <div>
              <p className="text-[9px] font-bold text-orange-100 uppercase tracking-widest leading-none mb-0.5">Marketplace</p>
              <p className="text-xl font-black tracking-tight text-white leading-none">Seller Hub</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-6">
            Build your<br />
            online business
          </h1>
          <p className="text-orange-100 text-lg mb-8 leading-relaxed">
            Set up your seller account and start reaching millions of customers.
          </p>

          <div className="space-y-4">
            {[
              { label: 'Step 1', text: 'Create your seller account' },
              { label: 'Step 2', text: 'Set up your business profile' },
              { label: 'Step 3', text: 'Create your shop page' },
              { label: 'Step 4', text: 'Submit for review' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i < step - 1 ? 'bg-white/30 text-white' : i === step - 1 ? 'bg-white text-orange-600' : 'bg-white/10 text-orange-200'
                }`}>
                  {i + 1}
                </div>
                <p className={`text-sm font-semibold ${i === step - 1 ? 'text-white' : 'text-orange-200'}`}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-orange-200 text-sm">
            &copy; {new Date().getFullYear()} Marketplace Seller Hub
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg py-4">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Marketplace</p>
              <p className="text-base font-black text-gray-900 leading-none">Seller Hub</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {s}
                </div>
                <span className={`text-sm font-semibold ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s === 1 ? 'Account' : 'Shop Setup'}
                </span>
                {s < 2 && <div className={`h-px w-8 mx-1 ${step > s ? 'bg-orange-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form id="step1-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Create your account</h2>
                <p className="text-gray-500 text-sm">Enter your account details to get started</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name *</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyen Van A"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seller@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Password *</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Confirm Password *</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400" />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
              )}

              <button type="submit" form="step1-form"
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-base font-bold text-white transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.99] shadow-lg shadow-orange-500/20">
                Continue to Shop Setup &rarr;
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Set up your shop</h2>
                <p className="text-gray-500 text-sm">Tell customers about your business</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Business Name *</label>
                  <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="My Company Ltd."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Shop Name *</label>
                    <input type="text" required value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="My Awesome Shop"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Shop URL *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/shop/</span>
                      <input type="text" required value={shopSlug} onChange={(e) => setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="w-full rounded-xl border border-gray-200 bg-white pl-14 pr-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Shop Description</label>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell customers what makes your shop special..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Business Address *</label>
                  <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, District 1, Ho Chi Minh City"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400" />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
              )}

              {shopCreationFailed && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm">
                  <p className="font-bold text-amber-800">Account created! Shop setup pending.</p>
                  <p className="text-amber-700 mt-1">{shopCreationError || 'Shop creation is temporarily unavailable. You can complete it from your dashboard.'}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setError(''); setStep(1); }}
                  className="flex-1 cursor-pointer rounded-xl bg-gray-100 border border-gray-200 py-4 text-base font-semibold text-gray-700 transition-all hover:bg-gray-200 active:scale-[0.99]">
                  &larr; Back
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-[2] cursor-pointer rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-base font-bold text-white transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20">
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : 'Create Seller Account'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have a seller account?{' '}
              <Link href="/seller/login" className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-3 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              &larr; Back to storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
