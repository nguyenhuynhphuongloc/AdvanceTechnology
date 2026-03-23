import ShoppingProviders from '@/components/shopping/ShoppingProviders';
import type { ReactNode } from 'react';

export default function ProductLayout({ children }: { children: ReactNode }) {
	return <ShoppingProviders>{children}</ShoppingProviders>;
}
