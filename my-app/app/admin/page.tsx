import { fetchAdminProducts, fetchAdminOrders, fetchAdminUsers } from "@/lib/admin/api";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import Link from "next/link";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";

  // Fetch all data in parallel
  const [productsRes, ordersRes, usersRes] = await Promise.all([
    fetchAdminProducts(token, { limit: 1 }).catch(() => ({ items: [], total: 0 })),
    fetchAdminOrders(token).catch(() => ({ items: [], total: 0 })),
    fetchAdminUsers(token).catch(() => ({ items: [], total: 0 })),
  ]);

  const totalProducts = productsRes.total || productsRes.items.length;
  const totalOrders = ordersRes.total || ordersRes.items.length;
  const activeOrders = ordersRes.items.filter(
    (o: any) => o.status !== "completed" && o.status !== "cancelled" && o.status !== "failed"
  ).length;
  const totalSales = ordersRes.items
    .filter((o: any) => o.status === "completed")
    .reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0);
  const totalCustomers = usersRes.total || usersRes.items.length;

  const stats = [
    {
      label: "Total Sales",
      value: formatPrice(totalSales),
      description: "From completed orders",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
      href: "/admin/orders",
    },
    {
      label: "Active Orders",
      value: String(activeOrders),
      description: `${totalOrders} total orders`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
      ),
      href: "/admin/orders",
    },
    {
      label: "Total Products",
      value: String(totalProducts),
      description: "In your catalog",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
      ),
      href: "/admin/products",
    },
    {
      label: "Total Customers",
      value: String(totalCustomers),
      description: "Registered users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      ),
      href: "/admin/users",
    },
  ];

  // Recent orders for the table
  const recentOrders = ordersRes.items.slice(0, 5);

  return (
    <div className="p-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Dashboard</h1>
        <p className="text-text-muted">Overview of your store&apos;s performance.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group p-6 bg-surface border border-border-dim rounded-2xl hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-text-soft uppercase tracking-widest">{stat.label}</h3>
              <div className="text-text-soft group-hover:text-accent transition-colors">{stat.icon}</div>
            </div>
            <p className="text-3xl font-black text-foreground mb-1">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-foreground">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-accent hover:text-accent-strong transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="bg-surface border border-border-dim rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-dim bg-surface-muted/50 text-[11px] font-black uppercase tracking-wider text-text-soft">
                <th className="p-4 pl-6">Order ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Items</th>
                <th className="p-4 text-right pr-6">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted">
                    No orders yet. Please log in as admin to see order data.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="p-4 pl-6 text-xs font-mono text-text-muted">{order.id.slice(0, 8)}…</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        order.status === "completed"
                          ? "bg-success/15 text-success"
                          : order.status === "failed" || order.status === "cancelled"
                            ? "bg-danger/15 text-danger"
                            : "bg-accent/15 text-accent"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold tabular-nums text-foreground">{order.items?.length || 0}</td>
                    <td className="p-4 text-right pr-6 font-black tabular-nums text-foreground">
                      {formatPrice(Number(order.totalAmount || 0))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
