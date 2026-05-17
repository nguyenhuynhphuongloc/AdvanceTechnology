import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { fetchAdminOrders } from "@/lib/admin/api";
import type { AdminOrderRecord } from "@/lib/admin/types";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";

type PageProps = { params: Promise<{ id: string }> };

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "VND" }).format(value);

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";

  let order: AdminOrderRecord | null = null;
  try {
    const { items } = await fetchAdminOrders(token);
    order = items.find((o) => o.id === id) ?? null;
  } catch {
    order = null;
  }

  if (!order) {
    notFound();
  }

  const addr = order.shippingAddressSnapshot;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-admin-muted hover:text-admin-text transition-colors">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-sm text-admin-muted">
            {new Date(order.createdAt).toLocaleString("vi-VN")} — ID: {order.id}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="admin-surface p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Status</p>
            <p className="font-black text-admin-text">{order.status}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Payment</p>
            <p className="font-black text-admin-text uppercase">{order.paymentMethod}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Payment Status</p>
            <p className="font-black text-admin-text">{order.paymentStatus}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Total</p>
            <p className="font-black text-admin-accent text-lg">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>

        {order.cancelledAt && (
          <div className="mt-4 p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
            <p className="text-sm font-bold text-red-500">Cancelled on {new Date(order.cancelledAt).toLocaleString("vi-VN")}</p>
            {order.cancelReason && <p className="text-sm text-admin-muted mt-1">Reason: {order.cancelReason}</p>}
          </div>
        )}
      </div>

      {/* Customer & Shipping */}
      <div className="admin-surface p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-admin-muted mb-4">Customer & Shipping</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Buyer ID</p>
            <p className="font-mono text-xs">{order.buyerId}</p>
          </div>
          {addr && (
            <>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Customer</p>
                <p className="font-bold">{addr.fullName}</p>
                <p className="text-sm text-admin-muted">{addr.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Address</p>
                <p className="text-sm">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Shop Orders */}
      <div className="admin-surface p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-admin-muted mb-4">
          Shop Orders ({order.shopOrders.length})
        </h2>
        <div className="space-y-4">
          {order.shopOrders.map((so) => (
            <div key={so.id} className="border border-admin-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-black text-admin-text">{so.shopId}</p>
                  <p className="font-mono text-xs text-admin-muted">{so.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-zinc-100 text-zinc-700">
                    {so.status}
                  </span>
                  <Link href={`/admin/shop-orders/${so.id}`} className="text-xs font-bold text-admin-accent underline">
                    Detail
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                {so.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-t border-admin-border">
                    {item.imageUrlSnapshot && (
                      <div className="w-10 h-10 bg-zinc-100 rounded overflow-hidden flex-shrink-0">
                        <img src={item.imageUrlSnapshot} alt={item.productNameSnapshot} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.productNameSnapshot}</p>
                      {item.variantNameSnapshot && <p className="text-xs text-admin-muted">{item.variantNameSnapshot}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold">{formatPrice(item.unitPrice)} x{item.quantity}</p>
                      <p className="text-xs font-black text-admin-accent">{formatPrice(item.lineTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-admin-border flex justify-between text-sm">
                <span className="text-admin-muted">Subtotal: {formatPrice(so.subtotal)}</span>
                <span className="text-admin-muted">Shipping: {formatPrice(so.shippingFee)}</span>
                <span className="font-black">Total: {formatPrice(so.shopTotal)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="admin-surface p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-admin-muted mb-4">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-admin-muted">Subtotal</span>
            <span className="font-bold">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-admin-muted">Shipping Fee</span>
            <span className="font-bold">{formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-admin-border pt-2">
            <span className="font-black">Total</span>
            <span className="font-black text-admin-accent text-lg">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
        {order.note && (
          <div className="mt-4 pt-4 border-t border-admin-border">
            <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Note</p>
            <p className="text-sm text-admin-text">{order.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
