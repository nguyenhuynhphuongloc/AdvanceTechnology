import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { AdminLayout } from "./components/admin/AdminLayout";

import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Analytics from "./pages/admin/Analytics";
import Users from "./pages/admin/Users";
import UserDetail from "./pages/admin/UserDetail";
import Sellers from "./pages/admin/Sellers";
import SellerProfiles from "./pages/admin/SellerProfiles";
import ShopApprovals from "./pages/admin/ShopApprovals";
import ProductApprovals from "./pages/admin/ProductApprovals";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Inventory from "./pages/admin/Inventory";
import MediaLibrary from "./pages/admin/MediaLibrary";
import Orders from "./pages/admin/Orders";
import OrderDetail from "./pages/admin/OrderDetail";
import ShopOrders from "./pages/admin/ShopOrders";
import Payments from "./pages/admin/Payments";
import Carts from "./pages/admin/Carts";
import Refunds from "./pages/admin/Refunds";
import Commissions from "./pages/admin/Commissions";
import Notifications from "./pages/admin/Notifications";
import Settings from "./pages/admin/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />

          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="sellers" element={<Sellers />} />
          <Route path="seller-profiles" element={<SellerProfiles />} />

          <Route path="shop-approvals" element={<ShopApprovals />} />
          <Route path="product-approvals" element={<ProductApprovals />} />

          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="media-library" element={<MediaLibrary />} />

          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="shop-orders" element={<ShopOrders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="carts" element={<Carts />} />

          <Route path="refunds" element={<Refunds />} />
          <Route path="commissions" element={<Commissions />} />

          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}