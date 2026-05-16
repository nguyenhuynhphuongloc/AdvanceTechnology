import { fetchAdminOrders } from "@/lib/admin/api";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const { items: orders } = await fetchAdminOrders(token).catch(() => ({ items: [] }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Orders</h1>
          <p className="text-text-muted">Track order fulfillment and payments.</p>
        </div>
      </div>
      
      <div className="bg-surface border border-border-dim rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-dim bg-surface-muted/50 text-[11px] font-black uppercase tracking-wider text-text-soft">
              <th className="p-4 pl-6">Order ID</th>
              <th className="p-4">Customer ID</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dim">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-muted">
                  No orders found or unauthorized. Please log in as admin.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="p-4 pl-6 text-xs font-mono text-text-muted">{order.id.slice(0, 8)}…</td>
                  <td className="p-4 text-sm font-bold text-foreground">{order.authUserId?.slice(0, 8) || 'Guest'}…</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'bg-success/20 text-success' : 'bg-surface-strong text-text-soft'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6 font-bold tabular-nums text-foreground">{formatPrice(order.totalAmount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
