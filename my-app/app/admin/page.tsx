import Link from "next/link";
import { cookies } from "next/headers";
import {
  fetchAdminOrders,
  fetchAdminUsers,
  fetchAdminShops,
  fetchAdminModerationProducts,
  fetchAdminSellerProfiles,
} from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminDataTable } from "@/components/ui/AdminDataTable";
import AdminStatCard from "@/components/admin/AdminStatCard";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

function orderTone(status: string) {
  if (status === "completed" || status === "delivered") return "success" as const;
  if (status === "failed" || status === "cancelled") return "danger" as const;
  if (status === "awaiting_payment") return "warning" as const;
  return "accent" as const;
}

function shopStatusTone(status: string) {
  if (status === "approved" || status === "active") return "success" as const;
  if (status === "rejected" || status === "suspended") return "danger" as const;
  if (status === "pending") return "warning" as const;
  return "accent" as const;
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";

  const [ordersRes, usersRes, shopsRes, pendingShopsRes, pendingProductsRes, sellerProfilesRes] =
    await Promise.all([
      fetchAdminOrders(token).catch(() => ({ items: [], total: 0 })),
      fetchAdminUsers(token).catch(() => ({ items: [], total: 0 })),
      fetchAdminShops(token).catch(() => ({ items: [], total: 0 })),
      fetchAdminShops(token, { status: "pending" }).catch(() => ({ items: [], total: 0 })),
      fetchAdminModerationProducts(token, { approvalStatus: "pending", limit: 5 }).catch(() => ({ items: [], total: 0 })),
      fetchAdminSellerProfiles(token).catch(() => ({ items: [], total: 0 })),
    ]);

  const platformRevenue = ordersRes.items
    .filter((order) => ["delivered", "paid", "processing", "shipped"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const activeOrders = ordersRes.items.filter(
    (order) => !["delivered", "cancelled", "refunded"].includes(order.status),
  ).length;
  const recentOrders = ordersRes.items.slice(0, 5);
  const pendingShops = pendingShopsRes.items.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-admin-muted">Platform Overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-admin-text">Dashboard</h1>
          <p className="mt-1 text-sm text-admin-muted">Platform-level metrics: users, stores, orders, and approvals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/shop-approvals" className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
            Shop Approvals
          </Link>
          <Link href="/admin/product-approvals" className="rounded-lg border border-admin-border bg-white px-4 py-2 text-sm font-semibold text-admin-text hover:bg-gray-50 transition-colors">
            Product Approvals
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Link href="/admin/users">
          <AdminStatCard
            label="Total Users"
            value={String(usersRes.total || usersRes.items.length)}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
        </Link>
        <Link href="/admin/seller-profiles">
          <AdminStatCard
            label="Sellers"
            value={String(sellerProfilesRes.total || sellerProfilesRes.items.length)}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          />
        </Link>
        <Link href="/admin/stores">
          <AdminStatCard
            label="Total Stores"
            value={String(shopsRes.total || shopsRes.items.length)}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5M3 9h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9zM9 21V12h6v9" /></svg>}
          />
        </Link>
        <Link href="/admin/orders">
          <AdminStatCard
            label="Platform Revenue"
            value={formatPrice(platformRevenue)}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </Link>
        <Link href="/admin/shop-approvals">
          <AdminStatCard
            label="Pending Shops"
            value={String(pendingShopsRes.total || pendingShopsRes.items.length)}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" /></svg>}
          />
        </Link>
        <Link href="/admin/orders">
          <AdminStatCard
            label="Active Orders"
            value={String(activeOrders)}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="admin-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-admin-text">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-admin-accent hover:opacity-80 transition-opacity">View all →</Link>
          </div>
          <AdminDataTable
            rows={recentOrders}
            getRowKey={(order) => order.id}
            emptyTitle="No orders yet"
            emptyDescription="Orders will appear here after customers checkout."
            columns={[
              { key: "id", header: "Order", render: (order) => <span className="font-mono text-xs">{order.id.slice(0, 10)}</span> },
              { key: "status", header: "Status", render: (order) => <StatusBadge tone={orderTone(order.status)}>{order.status}</StatusBadge> },
              { key: "items", header: "Items", render: (order) => order.shopOrders.reduce((sum: number, so: { items?: unknown[] }) => sum + (so.items?.length ?? 0), 0) },
              { key: "total", header: "Total", className: "text-right", render: (order) => formatPrice(order.totalAmount) },
            ]}
          />
        </div>

        <div className="admin-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-admin-text">Pending shop approvals</h2>
            <Link href="/admin/shop-approvals" className="text-sm font-semibold text-admin-accent hover:opacity-80 transition-opacity">Review →</Link>
          </div>
          <div className="space-y-3">
            {pendingShops.length === 0 ? (
              <p className="rounded-xl border border-dashed border-admin-border px-4 py-8 text-center text-sm text-admin-muted">
                No pending shop approvals.
              </p>
            ) : (
              pendingShops.map((shop) => (
                <div key={shop.id} className="rounded-xl border border-admin-border bg-admin-surface-muted p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-admin-text">{shop.shopName}</p>
                      <p className="font-mono text-xs text-admin-muted">{shop.slug}</p>
                    </div>
                    <StatusBadge tone={shopStatusTone(shop.status)}>{shop.status}</StatusBadge>
                  </div>
                </div>
              ))
            )}
            {pendingProductsRes.items.length > 0 && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-700">
                  {pendingProductsRes.total || pendingProductsRes.items.length} product{(pendingProductsRes.total || pendingProductsRes.items.length) !== 1 ? "s" : ""} awaiting approval
                </p>
                <Link href="/admin/product-approvals" className="mt-1 block text-xs font-semibold text-amber-600 hover:underline">
                  Review product approvals →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
