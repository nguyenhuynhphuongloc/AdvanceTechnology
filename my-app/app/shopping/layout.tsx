import ShoppingProviders from '@/components/shopping/ShoppingProviders';
import type { ReactNode } from 'react';

export default function ShoppingLayout({ children }: { children: ReactNode }) {
  return <ShoppingProviders>{children}</ShoppingProviders>;
}
