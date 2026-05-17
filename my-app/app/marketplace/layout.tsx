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
    <div
      style={{ background: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      className="marketplace-shell"
    >
      <MarketplaceHeader />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <MarketplaceFooter />
    </div>
  );
}
