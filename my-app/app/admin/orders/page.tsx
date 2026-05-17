import Link from "next/link";
import { cookies } from "next/headers";
import { fetchAdminOrders } from "@/lib/admin/api";
import type { AdminOrderRecord } from "@/lib/admin/types";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { AdminDataTable } from "@/components/ui/AdminDataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminPagination } from "@/components/ui/AdminPagination";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function orderTone(status: string) {
  if (status === "completed" || status === "delivered") return "success" as const;
  if (status === "failed" || status === "cancelled") return "danger" as const;
  if (status === "awaiting_payment") return "warning" as const;
  return "accent" as const;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const params = await searchParams;
  const status = readParam(params, "status") ?? "all";
  const query = (readParam(params, "search") ?? "").toLowerCase();
  const page = Math.max(1, Number(readParam(params, "page") ?? "1") || 1);
  const limit = 20;
  const { items: orders } = await fetchAdminOrders(token).catch(() => ({ items: [], total: 0 }));
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = status === "all" || order.status === status;
    const matchesSearch =
      !query ||
      order.id.toLowerCase().includes(query) ||
      (order.buyerId ?? "").toLowerCase().includes(query) ||
      (order.shippingAddressSnapshot?.fullName ?? "").toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
  const pagedOrders = filteredOrders.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Commerce</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Orders</h1>
        <p className="mt-2 text-sm text-admin-muted">Track order status, payments, users, and totals.</p>
      </div>

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px_auto]" action="/admin/orders">
        <input
          name="search"
          defaultValue={query}
          placeholder="Search order, user, or email..."
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="awaiting_payment">Awaiting payment</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="partially_shipped">Partially shipped</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">Filter</button>
      </form>

      <AdminDataTable
        rows={pagedOrders}
        getRowKey={(order) => order.id}
        emptyTitle="No orders found"
        emptyDescription="Orders will appear here after checkout or after filters are cleared."
        columns={[
          { key: "id", header: "Order", render: (order) => <span className="font-mono text-xs">{order.id.slice(0, 12)}</span> },
          {
            key: "customer",
            header: "Customer",
            render: (order) => (
              <div>
                <p className="font-bold text-admin-text">{order.shippingAddressSnapshot?.fullName ?? "Unknown customer"}</p>
                <p className="font-mono text-xs text-admin-muted">{order.buyerId ?? "guest"}</p>
              </div>
            ),
          },
          { key: "items", header: "Items", render: (order: AdminOrderRecord) => order.shopOrders.reduce((sum: number, so: AdminOrderRecord['shopOrders'][number]) => sum + (so.items?.length ?? 0), 0) },
          { key: "payment", header: "Payment", render: (order) => order.paymentMethod },
          { key: "status", header: "Status", render: (order) => <StatusBadge tone={orderTone(order.status)}>{order.status}</StatusBadge> },
          { key: "total", header: "Total", className: "text-right", render: (order) => formatPrice(order.totalAmount) },
          {
            key: "actions",
            header: "Links",
            className: "text-right",
            render: (order) => (
              <Link href={`/admin/orders/${order.id}`} className="font-bold text-admin-accent">
                Detail
              </Link>
            ),
          },
        ]}
      />
      <AdminPagination
        basePath="/admin/orders"
        page={page}
        limit={limit}
        total={filteredOrders.length}
        query={{ search: query, status }}
      />
    </div>
  );
}
