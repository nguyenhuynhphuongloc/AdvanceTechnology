'use client';

import { CartProvider } from '@/lib/shopping/cart-context';
import { AuthProvider } from '@/lib/shopping/auth-context';
import type { ReactNode } from 'react';

export default function ShoppingProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
