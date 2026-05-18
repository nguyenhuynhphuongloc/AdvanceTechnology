'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { fetchMyOrders, type OrderSummary } from '@/lib/marketplace';
import { getMarketplaceToken, getMarketplaceUser } from '@/lib/marketplace/auth-api';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CartIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  StoreIcon,
  UserIcon,
  buttonClassName,
  formatVnd,
} from '@/components/marketplace/MarketplaceUI';

type SessionUser = {
  name: string;
  email: string;
  phone: string;
};

function getToken(): string | null {
  return getMarketplaceToken();
}

function parseUserFromToken(): SessionUser {
  const storedUser = getMarketplaceUser();
  if (storedUser) {
    return {
      name: storedUser.name || storedUser.email.split('@')[0] || 'Marketplace User',
      email: storedUser.email,
      phone: 'Not provided',
    };
  }
  const token = getToken();
  if (!token) return { name: 'Marketplace User', email: 'Not signed in', phone: 'Not provided' };
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return {
      name: payload.name || payload.fullName || payload.email?.split('@')[0] || 'Marketplace User',
      email: payload.email || 'Not provided',
      phone: payload.phone || 'Not provided',
    };
  } catch {
    return { name: 'Marketplace User', email: 'Not provided', phone: 'Not provided' };
  }
}

export default function ProfilePage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [user, setUser] = useState<SessionUser>({ name: 'Marketplace User', email: 'Loading...', phone: 'Not provided' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(Boolean(token));
    setUser(parseUserFromToken());
    if (token) {
      fetchMyOrders({ limit: 50 }).then((data) => setOrders(data.items)).catch(() => setOrders([]));
    }
  }, []);

  const stats = useMemo(() => ({
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
  }), [orders]);

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'MU';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Profile</h1>

      {!isLoggedIn ? (
        <Card className="p-12 text-center">
          <UserIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">Please log in to view your profile</h3>
          <p className="mb-6 text-gray-600">Buyer profile is separate from seller accounts.</p>
          <Link href="/marketplace/login?next=/marketplace/profile" className={buttonClassName()}>
            Log In
          </Link>
        </Card>
      ) : (

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-2xl font-bold text-white">
                  {initials}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-gray-600">Member since May 2026</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="mt-4" disabled>
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Saved Addresses
                </span>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <MapPinIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="mb-4 text-gray-600">Manage your saved addresses for faster checkout.</p>
                <Button variant="outline" disabled>Add Address</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/marketplace/orders" className={buttonClassName({ variant: 'outline', className: 'w-full justify-start' })}>
                <PackageIcon className="h-4 w-4 mr-2" />
                My Orders
              </Link>
              <Link href="/marketplace/cart" className={buttonClassName({ variant: 'outline', className: 'w-full justify-start' })}>
                <CartIcon className="h-4 w-4 mr-2" />
                Shopping Cart
              </Link>
              <Link href="/seller" className={buttonClassName({ variant: 'outline', className: 'w-full justify-start' })}>
                <StoreIcon className="h-4 w-4 mr-2" />
                Seller Center
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="text-2xl font-bold">{stats.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="text-2xl font-bold text-blue-600">{formatVnd(stats.totalSpent)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}
