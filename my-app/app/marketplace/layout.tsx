import type { Metadata } from 'next';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { MarketplaceFooter } from '@/components/marketplace/MarketplaceFooter';

export const metadata: Metadata = {
  title: 'Marketplace | Advance Technology',
  description: 'Browse products and shops on the Advance Technology Marketplace.',
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketplace-shell flex min-h-screen flex-col bg-white text-gray-950">
      <MarketplaceHeader />
      <main className="flex-1">
        {children}
      </main>
      <MarketplaceFooter />
    </div>
  );
}
