"use client";

import { useState, useCallback } from "react";
import { useAdminToken } from "@/components/admin/AdminSessionGate";
import {
  fetchAdminModerationProducts,
  approveProduct,
  rejectProduct,
  hideProduct,
} from "@/lib/admin/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLoadingState from "@/components/admin/AdminLoadingState";
import AdminActionBar from "@/components/admin/AdminActionBar";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import AdminModal from "@/components/admin/AdminModal";
import type { AdminModerationProduct } from "@/lib/admin/types";

export default function ProductApprovalsPage() {
  const token = useAdminToken();
  const [products, setProducts] = useState<AdminModerationProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [actionTarget, setActionTarget] = useState<{
    product: AdminModerationProduct;
    action: "approve" | "reject" | "hide";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminModerationProducts(token, { approvalStatus: "pending" });
      setProducts(data.items ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
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
        await approveProduct(token, actionTarget.product.id);
      } else if (actionTarget.action === "reject") {
        if (!rejectReason.trim()) {
          alert("Rejection reason is required");
          setActionLoading(false);
          return;
        }
        await rejectProduct(token, actionTarget.product.id, { rejectionReason: rejectReason });
      } else if (actionTarget.action === "hide") {
        await hideProduct(token, actionTarget.product.id);
      }
      setShowRejectModal(false);
      setActionTarget(null);
      setRejectReason("");
      await loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
      setActionLoading(false);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.shopName ?? "").toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const dialogConfig = {
    approve: {
      title: "Approve Product",
      description: `Approve "${actionTarget?.product.name}"? It will be published.`,
      confirmLabel: "Approve",
      variant: "info" as const,
    },
    reject: {
      title: "Reject Product",
      description: `Are you sure you want to reject "${actionTarget?.product.name}"?`,
      confirmLabel: "Reject",
      variant: "danger" as const,
    },
    hide: {
      title: "Hide Product",
      description: `Hide "${actionTarget?.product.name}"? It will be removed from public view.`,
      confirmLabel: "Hide",
      variant: "warning" as const,
    },
  };

  return (
    <div>
      <AdminPageHeader
        title="Product Approvals"
        subtitle="Moderation"
        description="Review and moderate pending product submissions."
      />

      <AdminActionBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search by product or shop name...",
        }}
        actions={
          <button
            type="button"
            onClick={() => loadProducts()}
            className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-sm font-semibold text-admin-text transition hover:bg-slate-50"
          >
            Refresh
          </button>
        }
      />

      {loading ? (
        <AdminLoadingState label="Loading pending products..." />
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => loadProducts()}
            className="mt-2 text-sm font-semibold text-red-600 underline"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title="No pending products"
          description="There are no products waiting for moderation."
          action={{ label: "Refresh", onClick: () => loadProducts() }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-admin-border bg-white">
          <table className="min-w-full divide-y divide-admin-border">
            <thead className="bg-admin-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Shop
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Price
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
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-admin-text">{product.name}</p>
                        <p className="text-xs text-admin-muted">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-muted">
                    {product.shopName ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-admin-text">
                    ${Number(product.basePrice).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <AdminStatusBadge status={product.approvalStatus ?? product.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-muted">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {(product.approvalStatus ?? product.status) === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActionTarget({ product, action: "approve" })}
                          className="mr-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActionTarget({ product, action: "reject" });
                            setShowRejectModal(true);
                          }}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {(product.approvalStatus ?? product.status) === "approved" && (
                      <button
                        type="button"
                        onClick={() => setActionTarget({ product, action: "hide" })}
                        className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700"
                      >
                        Hide
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
          title="Reject Product"
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
                {actionLoading ? "Rejecting..." : "Reject Product"}
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-admin-muted">
              Please provide a reason for rejecting{" "}
              <strong>{actionTarget.product.name}</strong>.
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
