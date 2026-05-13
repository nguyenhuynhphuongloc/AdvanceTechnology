'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/shopping/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRODUCT_LIST_PATH } from '@/lib/products/routes';
import { storefrontBranding } from '@/lib/storefront/config';

export default function AccountPageClient({
  initialMode,
  redirectTo,
  defaultRole = 'user',
}: {
  initialMode: 'login' | 'register';
  redirectTo?: string;
  defaultRole?: string;
}) {
  const { user, login, register, logout } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [stripeCard, setStripeCard] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = login(email, password);
    if (ok) {
      router.push(redirectTo || PRODUCT_LIST_PATH);
    } else {
      setError('Incorrect email or password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (defaultRole === 'seller') {
      if (!shopName || !address || !stripeCard) {
        setError('Please fill in all seller details.');
        return;
      }
    }

    const ok = register(
      name, 
      email, 
      password, 
      defaultRole,
      shopName,
      address,
      stripeCard
    );
    if (ok) {
      router.push(redirectTo || PRODUCT_LIST_PATH);
    } else {
      setError('This email is already registered.');
    }
  };

  if (user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-6">
        <div className="w-full max-w-md rounded-[32px] bg-zinc-900 border border-zinc-800 p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
          <Link
            href={PRODUCT_LIST_PATH}
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-800 px-5 py-2 text-sm font-bold text-zinc-300 transition-all hover:bg-zinc-700 hover:-translate-x-1"
          >
            {"<"} Back to store
          </Link>

          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700 text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white">Hello, {user.name}!</h1>
          <p className="mt-2 text-base text-zinc-400 font-medium">{user.email}</p>
          
          {user.role === 'seller' && user.shopName && (
            <div className="mt-6 p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Your Store</p>
              <p className="text-lg font-bold text-white">{user.shopName}</p>
              <p className="text-xs text-zinc-400 mt-1">{user.address}</p>
            </div>
          )}

          <div className="mt-10 space-y-3">
            <Link
              href="/product/account"
              className="flex w-full items-center justify-center rounded-2xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-zinc-200"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={logout}
              className="w-full cursor-pointer rounded-2xl border border-zinc-700 py-4 text-sm font-bold text-zinc-300 transition-all hover:bg-zinc-800 active:scale-[0.98]"
            >
              Sign out
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4 font-sans">
      <div className="w-full max-w-md min-h-[580px] flex flex-col rounded-[28px] bg-zinc-900 border border-zinc-800 p-7 shadow-2xl animate-in fade-in zoom-in duration-700">
        <Link
          href={PRODUCT_LIST_PATH}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-700 hover:text-white hover:-translate-x-1"
        >
          {"<"} Back to store
        </Link>

        <div className="mb-6 rounded-2xl bg-zinc-800/50 p-4 border border-zinc-700">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black text-lg font-black shadow-sm border border-zinc-700 text-white">
              {storefrontBranding.logoText}
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Official Store</p>
              <p className="text-2xl font-black tracking-tighter text-white -mt-1">
                {storefrontBranding.brandName}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex rounded-[16px] bg-zinc-950 p-1 border border-zinc-800">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 cursor-pointer rounded-[12px] py-2.5 text-sm font-bold transition-all duration-300 ${mode === 'login' ? 'bg-white text-black shadow-sm' : 'text-white hover:text-zinc-200'}`}
          >
            Log in
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 cursor-pointer rounded-[12px] py-2.5 text-sm font-bold transition-all duration-300 ${mode === 'register' ? 'bg-white text-black shadow-sm' : 'text-white hover:text-zinc-200'}`}
          >
            Create account
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-zinc-600"
              />
            </div>

            {error && <p className="text-sm font-bold text-red-500 px-1">{error}</p>}

            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-accent py-4 text-sm font-black text-accent-contrast transition-all hover:bg-accent-strong hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-accent/20 mt-2 uppercase tracking-widest"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-white">Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-white">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-white">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-zinc-600"
              />
            </div>

            {defaultRole === 'seller' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-white">Shop Name</label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="My Store"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-white">Stripe Account ID</label>
                    <input
                      type="text"
                      required
                      value={stripeCard}
                      onChange={(e) => setStripeCard(e.target.value)}
                      placeholder="acct_xxxxxxxxxxxx"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-white">Shop Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Market St, City"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-zinc-600"
                  />
                </div>
              </>
            )}

            {error && <p className="text-sm font-bold text-red-500 px-1">{error}</p>}

            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-accent py-4 text-sm font-black text-accent-contrast transition-all hover:bg-accent-strong hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-accent/20 mt-2 uppercase tracking-widest"
            >
              Sign Up
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
