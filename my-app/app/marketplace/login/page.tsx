'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginCustomer, saveMarketplaceSession } from '@/lib/marketplace/auth-api';
import {
  ArrowRightIcon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  StoreIcon,
  buttonClassName,
} from '@/components/marketplace/MarketplaceUI';

function getNextPath() {
  if (typeof window === 'undefined') return '/marketplace';
  return new URLSearchParams(window.location.search).get('next') || '/marketplace';
}

export default function MarketplaceLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await loginCustomer(email.trim(), password);
      saveMarketplaceSession(result.accessToken, result.user);
      router.replace(getNextPath());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-340px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <StoreIcon className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Buyer Login</CardTitle>
          <p className="text-sm text-gray-600">Sign in to use cart, checkout, orders, and profile.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 space-y-3 text-center text-sm">
            <p className="text-gray-600">
              New to the marketplace?{' '}
              <Link href="/marketplace/register" className="font-semibold text-blue-600 hover:underline">
                Create buyer account
              </Link>
            </p>
            <Link href="/seller/login" className={buttonClassName({ variant: 'outline', className: 'w-full' })}>
              Seller Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
