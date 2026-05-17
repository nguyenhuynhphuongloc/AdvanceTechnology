import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';

export function MarketplaceLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
