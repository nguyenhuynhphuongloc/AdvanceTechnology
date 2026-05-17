"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchAdminShopOrderDetail, updateAdminShopOrderStatus } from "@/lib/admin/api";
import type { AdminShopOrderRecord } from "@/lib/admin/types";

export default function AdminShopOrderDetailPage() {
  const params = useParams();
  const shopOrderId = params.id as string;

  const [shopOrder, setShopOrder] = useState<AdminShopOrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAdminShopOrderDetail("", shopOrderId);
        setShopOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [shopOrderId]);

  const handleUpdateStatus = async (newStatus: string) => {
    const rawReason = newStatus === "cancelled" ? prompt("Enter cancellation reason:") : null;
    if (newStatus === "cancelled" && !rawReason) return;
    const reason = rawReason ?? undefined;

    setUpdating(true);
    try {
      const updated = await updateAdminShopOrderStatus("", shopOrderId, {
        status: newStatus,
        reason,
      });
      setShopOrder(updated);
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-admin-accent/20 border-t-admin-accent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !shopOrder) {
    return (
      <div className="space-y-6">
        <p className="text-red-500 font-bold">{error || "Not found"}</p>
        <Link href="/admin/shop-orders" className="text-admin-accent underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/shop-orders" className="text-admin-muted hover:text-admin-text">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Shop Order #{shopOrder.id.slice(0, 8)}</h1>
          <p className="text-sm text-admin-muted">Parent Order: {shopOrder.orderId}</p>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="admin-surface p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${getStatusColor(shopOrder.status)}`}>
              {shopOrder.status}
            </span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Shop Total</p>
            <p className="font-black text-admin-accent text-lg">{formatPrice(shopOrder.shopTotal)}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Shop</p>
            <p className="font-mono text-xs">{shopOrder.shopId}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Seller</p>
            <p className="font-mono text-xs">{shopOrder.sellerId}</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="border-t border-admin-border pt-4">
          <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-3">Admin Actions</p>
          <div className="flex gap-2 flex-wrap">
            {shopOrder.status === "pending" && (
              <button onClick={() => handleUpdateStatus("confirmed")} disabled={updating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
                {updating ? "..." : "Mark Confirmed"}
              </button>
            )}
            {shopOrder.status === "confirmed" && (
              <button onClick={() => handleUpdateStatus("processing")} disabled={updating}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
                {updating ? "..." : "Mark Processing"}
              </button>
            )}
            {(shopOrder.status === "confirmed" || shopOrder.status === "processing") && (
              <button onClick={() => handleUpdateStatus("shipped")} disabled={updating}
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
                {updating ? "..." : "Mark Shipped"}
              </button>
            )}
            {shopOrder.status === "shipped" && (
              <button onClick={() => handleUpdateStatus("delivered")} disabled={updating}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
                {updating ? "..." : "Mark Delivered"}
              </button>
            )}
            {["pending", "confirmed", "processing"].includes(shopOrder.status) && (
              <button onClick={() => handleUpdateStatus("cancelled")} disabled={updating}
                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider hover:bg-red-100 disabled:opacity-50">
                {updating ? "..." : "Cancel Order"}
              </button>
            )}
          </div>
        </div>

        {shopOrder.cancelledAt && (
          <div className="mt-4 p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
            <p className="text-sm font-bold text-red-500">Cancelled on {new Date(shopOrder.cancelledAt).toLocaleString("vi-VN")}</p>
            {shopOrder.cancelReason && <p className="text-sm text-admin-muted mt-1">Reason: {shopOrder.cancelReason}</p>}
          </div>
        )}
      </div>

      {/* Shipping Info */}
      {(shopOrder.trackingNumber || shopOrder.shippingProvider) && (
        <div className="admin-surface p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-admin-muted mb-4">Shipping</h2>
          <div className="grid grid-cols-2 gap-4">
            {shopOrder.shippingProvider && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Provider</p>
                <p className="font-bold">{shopOrder.shippingProvider}</p>
              </div>
            )}
            {shopOrder.trackingNumber && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-admin-muted mb-1">Tracking</p>
                <p className="font-mono font-bold">{shopOrder.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="admin-surface p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-admin-muted mb-4">
          Order Items ({shopOrder.items?.length ?? 0})
        </h2>
        <div className="space-y-3">
          {shopOrder.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3 border-t border-admin-border">
              {item.imageUrlSnapshot && (
                <div className="w-12 h-12 bg-zinc-100 rounded overflow-hidden flex-shrink-0">
                  <img src={item.imageUrlSnapshot} alt={item.productNameSnapshot} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{item.productNameSnapshot}</p>
                {item.variantNameSnapshot && <p className="text-xs text-admin-muted">{item.variantNameSnapshot}</p>}
                {item.skuSnapshot && <p className="text-[10px] font-mono text-admin-muted">SKU: {item.skuSnapshot}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold">{formatPrice(item.unitPrice)} x{item.quantity}</p>
                <p className="text-xs font-black text-admin-accent">{formatPrice(item.lineTotal)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial */}
      <div className="admin-surface p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-admin-muted mb-4">Financial Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-admin-muted">Subtotal</span>
            <span className="font-bold">{formatPrice(shopOrder.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-admin-muted">Shipping Fee</span>
            <span className="font-bold">{formatPrice(shopOrder.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-admin-border pt-2">
            <span className="font-black">Shop Total</span>
            <span className="font-black text-admin-accent text-lg">{formatPrice(shopOrder.shopTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
