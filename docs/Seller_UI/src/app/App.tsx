import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from './components/ui/sonner';

// Seller Pages
import { SellerLayout } from './components/seller/SellerLayout';
import { SellerLanding } from './pages/seller/SellerLanding';
import { Login } from './pages/seller/Login';
import { Register } from './pages/seller/Register';
import { Dashboard } from './pages/seller/Dashboard';
import { ShopProfile } from './pages/seller/ShopProfile';
import { ProductsList } from './pages/seller/ProductsList';
import { ProductForm } from './pages/seller/ProductForm';
import { Inventory } from './pages/seller/Inventory';
import { OrdersList } from './pages/seller/OrdersList';
import { OrderDetail } from './pages/seller/OrderDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/seller" replace />} />

        {/* Seller Auth Routes */}
        <Route path="/seller/login" element={<Login />} />
        <Route path="/seller/register" element={<Register />} />

        {/* Seller Landing */}
        <Route path="/seller" element={<SellerLanding />} />

        {/* Seller Protected Routes */}
        <Route path="/seller" element={<SellerLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="shop" element={<ShopProfile />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/:id" element={<OrderDetail />} />
        </Route>
      </Routes>

      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
