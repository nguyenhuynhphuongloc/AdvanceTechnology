'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSellerAuth } from '@/lib/seller/auth-context';

export default function SellerLoginPage() {
  const { login, isLoggedIn, isLoading } = useSellerAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push('/seller/dashboard');
    }
  }, [isLoading, isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/seller/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      if (msg.toLowerCase().includes('credentials') || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('invalid')) {
        setError('Incorrect email or password. Please try again.');
      } else if (msg.toLowerCase().includes('not a seller')) {
        setError('This account is not a seller account.');
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
        {/* Background decoration */}
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
            Start selling on<br />
            our marketplace
          </h1>
          <p className="text-orange-100 text-lg mb-10 leading-relaxed">
            Join thousands of sellers growing their business with our all-in-one platform.
          </p>

          <div className="space-y-5">
            {[
              {
                icon: (
                  <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                title: 'Manage Products',
                desc: 'List and organize your catalog with ease',
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                ),
                title: 'Track Orders',
                desc: 'Real-time order management and updates',
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: 'Grow Your Shop',
                desc: 'Analytics and insights to scale your sales',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white font-bold text-base">{item.title}</p>
                  <p className="text-orange-200 text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-orange-200 text-sm">
            &copy; {new Date().getFullYear()} Marketplace Seller Hub. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Marketplace</p>
              <p className="text-base font-black text-gray-900 leading-none">Seller Hub</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Welcome back</h2>
            <p className="text-gray-500 text-base">Sign in to your seller account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@example.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-base font-bold text-white transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don&apos;t have a seller account?{' '}
              <Link
                href="/seller/register"
                className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              &larr; Back to storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
