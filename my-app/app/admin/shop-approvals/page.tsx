"use client";

import { useState, useCallback } from "react";
import { useAdminToken } from "@/components/admin/AdminSessionGate";
import {
  fetchAdminShops,
  approveShop,
  rejectShop,
  suspendShop,
} from "@/lib/admin/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLoadingState from "@/components/admin/AdminLoadingState";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import AdminModal from "@/components/admin/AdminModal";
import type { AdminShopRecord } from "@/lib/admin/types";

export default function ShopApprovalsPage() {
  const token = useAdminToken();
  const [shops, setShops] = useState<AdminShopRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionTarget, setActionTarget] = useState<{
    shop: AdminShopRecord;
    action: "approve" | "reject" | "suspend";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const loadShops = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminShops(token, { status: "pending" });
      setShops(data.items ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load shops";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
      }
      setShowRejectModal(false);
      setActionTarget(null);
      setRejectReason("");
      await loadShops();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
      setActionLoading(false);
    } finally {
      setActionLoading(false);
    }
  };

  const dialogConfig = {
    approve: {
      title: "Approve Shop",
      description: `Approve "${actionTarget?.shop.shopName}"? This shop will become active.`,
      confirmLabel: "Approve",
      variant: "info" as const,
    },
    reject: {
      title: "Reject Shop",
      description: `Are you sure you want to reject "${actionTarget?.shop.shopName}"?`,
      confirmLabel: "Reject",
      variant: "danger" as const,
    },
    suspend: {
      title: "Suspend Shop",
      description: `Suspend "${actionTarget?.shop.shopName}"? This shop will be temporarily disabled.`,
      confirmLabel: "Suspend",
      variant: "warning" as const,
    },
  };

  return (
    <div>
      <AdminPageHeader
        title="Shop Approvals"
        subtitle="Moderation"
        description="Review and approve pending shop registrations."
      />

      {loading ? (
        <AdminLoadingState label="Loading pending shops..." />
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
      ) : shops.length === 0 ? (
        <AdminEmptyState
          title="No pending shops"
          description="There are no shop registrations waiting for approval."
          action={{ label: "Refresh", onClick: () => loadShops() }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-admin-border bg-white">
          <table className="min-w-full divide-y divide-admin-border">
            <thead className="bg-admin-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Shop Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Submitted
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-admin-text">
                    {shop.shopName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-muted">
                    {shop.slug}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <AdminStatusBadge status={shop.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-muted">
                    {new Date(shop.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {shop.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActionTarget({ shop, action: "approve" })}
                          className="mr-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
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
                    {shop.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => setActionTarget({ shop, action: "suspend" })}
                        className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionTarget && !showRejectModal && (
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
          title="Reject Shop"
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
                {actionLoading ? "Rejecting..." : "Reject Shop"}
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
