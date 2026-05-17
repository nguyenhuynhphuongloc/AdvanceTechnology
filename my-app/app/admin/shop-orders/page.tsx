"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchAdminShopOrders } from "@/lib/admin/api";
import type { AdminShopOrderRecord } from "@/lib/admin/types";

export default function AdminShopOrdersPage() {
  const searchParams = useSearchParams();
  const [shopOrders, setShopOrders] = useState<AdminShopOrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 20;
  const status = searchParams.get("status") ?? "";
  const shopId = searchParams.get("shopId") ?? "";
  const sellerId = searchParams.get("sellerId") ?? "";
  const orderId = searchParams.get("orderId") ?? "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAdminShopOrders("", {
          page,
          limit,
          status: status || undefined,
          shopId: shopId || undefined,
          sellerId: sellerId || undefined,
          orderId: orderId || undefined,
        });
        setShopOrders(data.items ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        console.error("Failed to load shop orders:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, status, shopId, sellerId, orderId]);

  const totalPages = Math.ceil(total / limit);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "VND" }).format(value);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-700";
      case "confirmed": return "bg-blue-50 text-blue-700";
      case "processing": return "bg-purple-50 text-purple-700";
      case "shipped": return "bg-cyan-50 text-cyan-700";
      case "delivered": return "bg-green-50 text-green-700";
      case "cancelled": return "bg-red-50 text-red-700";
      default: return "bg-zinc-50 text-zinc-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Commerce</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Shop Orders</h1>
        <p className="mt-2 text-sm text-admin-muted">
          Per-shop order fulfillment. View and manage individual shop orders across the platform.
        </p>
      </div>

      {/* Filters */}
      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[auto_auto_auto_auto_auto]" action="/admin/shop-orders">
        <input
          name="orderId"
          defaultValue={orderId}
          placeholder="Order ID"
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent w-48"
        />
        <input
          name="shopId"
          defaultValue={shopId}
          placeholder="Shop ID"
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent w-48"
        />
        <input
          name="sellerId"
          defaultValue={sellerId}
          placeholder="Seller ID"
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent w-48"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">Filter</button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-admin-accent/20 border-t-admin-accent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      ) : shopOrders.length === 0 ? (
        <div className="py-20 text-center bg-admin-surface border border-admin-border rounded-lg">
          <p className="text-admin-muted font-bold">No shop orders found.</p>
        </div>
      ) : (
        <>
          <div className="admin-surface overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-admin-muted">Shop Order</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-admin-muted">Order</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-admin-muted">Shop</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-admin-muted">Seller</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-admin-muted">Items</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-admin-muted">Amount</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-admin-muted">Status</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-admin-muted">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {shopOrders.map((so) => (
                  <tr key={so.id} className="border-b border-admin-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs">{so.id.slice(0, 12)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/admin/orders/${so.orderId}`} className="font-mono text-xs text-admin-accent hover:underline">
                        {so.orderId.slice(0, 12)}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs">{so.shopId.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs">{so.sellerId.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold">{so.items?.length ?? 0}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-black">{formatPrice(so.shopTotal)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(so.status)}`}>
                        {so.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-admin-muted">
                        {new Date(so.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/admin/shop-orders/${so.id}`} className="text-xs font-bold text-admin-accent hover:underline">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-admin-muted">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/shop-orders?page=${page - 1}${status ? `&status=${status}` : ""}${shopId ? `&shopId=${shopId}` : ""}${sellerId ? `&sellerId=${sellerId}` : ""}${orderId ? `&orderId=${orderId}` : ""}`}
                    className="rounded-lg border border-admin-border px-4 py-2 text-sm font-bold text-admin-text hover:bg-white/[0.02]"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/shop-orders?page=${page + 1}${status ? `&status=${status}` : ""}${shopId ? `&shopId=${shopId}` : ""}${sellerId ? `&sellerId=${sellerId}` : ""}${orderId ? `&orderId=${orderId}` : ""}`}
                    className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
