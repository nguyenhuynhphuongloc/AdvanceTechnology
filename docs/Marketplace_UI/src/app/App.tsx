import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { MarketplaceLayout } from './components/marketplace/MarketplaceLayout';
import { MarketplaceHome } from './pages/marketplace/Home';
import { ProductsPage } from './pages/marketplace/Products';
import { ProductDetailPage } from './pages/marketplace/ProductDetail';
import { ShopsPage } from './pages/marketplace/Shops';
import { ShopDetailPage } from './pages/marketplace/ShopDetail';
import { CartPage } from './pages/marketplace/Cart';
import { CheckoutPage } from './pages/marketplace/Checkout';
import { OrdersPage } from './pages/marketplace/Orders';
import { OrderDetailPage } from './pages/marketplace/OrderDetail';
import { ProfilePage } from './pages/marketplace/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Navigate to="/marketplace" replace />} />

        <Route path="/marketplace" element={<MarketplaceLayout />}>
          <Route index element={<MarketplaceHome />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="shops/:slug" element={<ShopDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/marketplace" replace />} />
      </Routes>
    </BrowserRouter>
  );
}