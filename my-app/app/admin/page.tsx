import Link from "next/link";
import { cookies } from "next/headers";
import {
  fetchAdminInventory,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminUsers,
} from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminDataTable } from "@/components/ui/AdminDataTable";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

function orderTone(status: string) {
  if (status === "completed" || status === "delivered") return "success" as const;
  if (status === "failed" || status === "cancelled") return "danger" as const;
  if (status === "awaiting_payment") return "warning" as const;
  return "accent" as const;
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";

  const [productsRes, ordersRes, usersRes, inventoryRes] = await Promise.all([
    fetchAdminProducts(token, { limit: 5, status: "all" }).catch(() => ({ items: [], total: 0 })),
    fetchAdminOrders(token).catch(() => ({ items: [], total: 0 })),
    fetchAdminUsers(token).catch(() => ({ items: [], total: 0 })),
    fetchAdminInventory(token).catch(() => ({ items: [], total: 0 })),
  ]);

  const completedRevenue = ordersRes.items
    .filter((order) => order.status === "completed" || order.status === "delivered")
    .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const activeOrders = ordersRes.items.filter(
    (order) => !["completed", "delivered", "cancelled", "failed"].includes(order.status),
  ).length;
  const lowStock = inventoryRes.items.filter((item) => item.status === "low-stock" || item.availableStock <= 5);
  const recentOrders = ordersRes.items.slice(0, 5);

  const stats = [
    { label: "Total sales", value: formatPrice(completedRevenue), href: "/admin/orders" },
    { label: "Active orders", value: String(activeOrders), href: "/admin/orders" },
    { label: "Products", value: String(productsRes.total || productsRes.items.length), href: "/admin/products" },
    { label: "Customers", value: String(usersRes.total || usersRes.items.length), href: "/admin/users" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Overview</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Dashboard</h1>
          <p className="mt-2 text-sm text-admin-muted">Real data from products, orders, users, and inventory.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products" className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white">
            Add or edit product
          </Link>
          <Link href="/admin/media-library" className="rounded-lg border border-admin-border bg-white px-4 py-2 text-sm font-bold text-admin-text">
            Upload media
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-surface p-5 transition hover:-translate-y-0.5 hover:shadow-ui-md">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-admin-muted">{stat.label}</p>
            <p className="mt-3 text-3xl font-black text-admin-text">{stat.value}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="admin-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-admin-text">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-bold text-admin-accent">View all</Link>
          </div>
          <AdminDataTable
            rows={recentOrders}
            getRowKey={(order) => order.id}
            emptyTitle="No orders yet"
            emptyDescription="Orders will appear here after customers checkout."
            columns={[
              { key: "id", header: "Order", render: (order) => <span className="font-mono text-xs">{order.id.slice(0, 10)}</span> },
              { key: "status", header: "Status", render: (order) => <StatusBadge tone={orderTone(order.status)}>{order.status}</StatusBadge> },
              { key: "items", header: "Items", render: (order) => order.items.length },
              { key: "total", header: "Total", className: "text-right", render: (order) => formatPrice(order.totalAmount) },
            ]}
          />
        </div>

        <div className="admin-surface p-5">
          <h2 className="text-lg font-black text-admin-text">Low stock products</h2>
          <div className="mt-4 space-y-3">
            {lowStock.length === 0 ? (
              <p className="rounded-xl border border-dashed border-admin-border px-4 py-8 text-center text-sm text-admin-muted">
                No low-stock records right now.
              </p>
            ) : (
              lowStock.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-xl border border-admin-border bg-admin-surface-muted p-4">
                  <p className="font-mono text-xs text-admin-muted">{item.sku || item.variantId}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-admin-text">Available</span>
                    <StatusBadge tone="warning">{item.availableStock}</StatusBadge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
