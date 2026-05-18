"use client";

import { useState, useCallback } from "react";
import { useAdminToken } from "@/components/admin/AdminSessionGate";
import {
  fetchAdminShops,
  approveShop,
  rejectShop,
  suspendShop,
  restoreShop,
} from "@/lib/admin/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLoadingState from "@/components/admin/AdminLoadingState";
import AdminActionBar from "@/components/admin/AdminActionBar";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import AdminModal from "@/components/admin/AdminModal";
import type { AdminShopRecord } from "@/lib/admin/types";

type ShopAction = "approve" | "reject" | "suspend" | "restore";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "suspended"];

export default function AdminStoresPage() {
  const token = useAdminToken();
  const [shops, setShops] = useState<AdminShopRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [actionTarget, setActionTarget] = useState<{
    shop: AdminShopRecord;
    action: ShopAction;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const loadShops = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminShops(
        token,
        statusFilter !== "all" ? { status: statusFilter } : {},
      );
      setShops(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stores");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  const handleAction = async () => {
    if (!token || !actionTarget) return;
    setActionLoading(true);
    try {
      if (actionTarget.action === "approve") {
        await approveShop(token, actionTarget.shop.id);
      } else if (actionTarget.action === "reject") {
        if (!rejectReason.trim()) {
          alert("Rejection reason is required");
          setActionLoading(false);
          return;
        }
        await rejectShop(token, actionTarget.shop.id, { rejectionReason: rejectReason });
      } else if (actionTarget.action === "suspend") {
        await suspendShop(token, actionTarget.shop.id);
      } else if (actionTarget.action === "restore") {
        await restoreShop(token, actionTarget.shop.id);
      }
      setShowRejectModal(false);
      setActionTarget(null);
      setRejectReason("");
      await loadShops();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = shops.filter((s) =>
    search
      ? s.shopName.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase()) ||
        s.sellerId.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const dialogConfig: Record<Exclude<ShopAction, "reject">, { title: string; description: string; confirmLabel: string; variant: "info" | "warning" | "danger" }> = {
    approve: {
      title: "Approve Store",
      description: `Approve "${actionTarget?.shop.shopName}"? The store will be published on the platform.`,
      confirmLabel: "Approve",
      variant: "info",
    },
    suspend: {
      title: "Suspend Store",
      description: `Suspend "${actionTarget?.shop.shopName}"? The store will be hidden from buyers.`,
      confirmLabel: "Suspend",
      variant: "warning",
    },
    restore: {
      title: "Restore Store",
      description: `Restore "${actionTarget?.shop.shopName}"? The store will be made active again.`,
      confirmLabel: "Restore",
      variant: "info",
    },
  };

  return (
    <div>
      <AdminPageHeader
        title="All Stores"
        subtitle="Stores"
        description="Platform-wide view of all seller stores. Approve, suspend, or restore stores."
      />

      <AdminActionBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search by store name, slug, or seller ID...",
        }}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-sm font-medium text-admin-text outline-none focus:border-admin-accent"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => loadShops()}
              className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-sm font-semibold text-admin-text transition hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        }
      />

      {loading ? (
        <AdminLoadingState label="Loading stores..." />
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => loadShops()}
            className="mt-2 text-sm font-semibold text-red-600 underline"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title="No stores found"
          description="No stores match the current filters."
          action={{ label: "Refresh", onClick: () => loadShops() }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-admin-border bg-white">
          <table className="min-w-full divide-y divide-admin-border">
            <thead className="bg-admin-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">Store</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">Seller ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-admin-soft">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filtered.map((shop) => (
                <tr key={shop.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-3">
                      {shop.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={shop.logoUrl}
                          alt={shop.shopName}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-surface-muted text-xs font-bold text-admin-muted">
                          {shop.shopName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-admin-text">{shop.shopName}</p>
                        <p className="font-mono text-xs text-admin-muted">{shop.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-admin-muted">
                    {shop.sellerId.slice(0, 16)}…
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <AdminStatusBadge status={shop.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-muted">
                    {new Date(shop.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      {shop.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setActionTarget({ shop, action: "approve" })}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionTarget({ shop, action: "reject" });
                              setShowRejectModal(true);
                            }}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(shop.status === "approved" || shop.status === "active") && (
                        <button
                          type="button"
                          onClick={() => setActionTarget({ shop, action: "suspend" })}
                          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
                        >
                          Suspend
                        </button>
                      )}
                      {shop.status === "suspended" && (
                        <button
                          type="button"
                          onClick={() => setActionTarget({ shop, action: "restore" })}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionTarget && !showRejectModal && actionTarget.action !== "reject" && (
        <AdminConfirmDialog
          open
          onClose={() => setActionTarget(null)}
          onConfirm={handleAction}
          title={dialogConfig[actionTarget.action].title}
          description={dialogConfig[actionTarget.action].description}
          confirmLabel={dialogConfig[actionTarget.action].confirmLabel}
          variant={dialogConfig[actionTarget.action].variant}
          loading={actionLoading}
        />
      )}

      {actionTarget && showRejectModal && (
        <AdminModal
          open
          onClose={() => {
            setShowRejectModal(false);
            setActionTarget(null);
            setRejectReason("");
          }}
          title="Reject Store"
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setActionTarget(null);
                  setRejectReason("");
                }}
                className="rounded-lg border border-admin-border bg-white px-4 py-2 text-sm font-semibold text-admin-text transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={actionLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Reject Store"}
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-admin-muted">
              Please provide a reason for rejecting{" "}
              <strong>{actionTarget.shop.shopName}</strong>.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason (required)"
              rows={3}
              className="w-full rounded-lg border border-admin-border p-3 text-sm text-admin-text outline-none transition focus:border-admin-accent"
            />
          </div>
        </AdminModal>
      )}
    </div>
  );
}
