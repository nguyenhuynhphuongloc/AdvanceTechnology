"use client";

import { useState, useCallback, useEffect } from "react";
import { useAdminToken } from "@/components/admin/AdminSessionGate";
import {
  fetchAdminSellerProfiles,
  updateAdminSellerProfileStatus,
} from "@/lib/admin/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLoadingState from "@/components/admin/AdminLoadingState";
import AdminActionBar from "@/components/admin/AdminActionBar";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import type { AdminSellerProfile } from "@/lib/admin/types";

export default function SellerProfilesPage() {
  const token = useAdminToken();
  const [profiles, setProfiles] = useState<AdminSellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [actionTarget, setActionTarget] = useState<{
    profile: AdminSellerProfile;
    action: "approve" | "reject" | "suspend";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProfiles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminSellerProfiles(token, {
        status: statusFilter || undefined,
      });
      setProfiles(data.items ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load seller profiles";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (token) loadProfiles();
  }, [token, loadProfiles]);

  const handleAction = async () => {
    if (!token || !actionTarget) return;
    setActionLoading(true);
    try {
      const statusMap = {
        approve: "approved",
        reject: "rejected",
        suspend: "suspended",
      };
      await updateAdminSellerProfileStatus(token, actionTarget.profile.id, {
        status: statusMap[actionTarget.action],
      });
      setActionTarget(null);
      await loadProfiles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = profiles.filter((p) =>
    search
      ? p.businessName.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const dialogConfig = {
    approve: {
      title: "Approve Seller Profile",
      description: `Are you sure you want to approve "${actionTarget?.profile.businessName}"?`,
      confirmLabel: "Approve",
      variant: "info" as const,
    },
    reject: {
      title: "Reject Seller Profile",
      description: `Are you sure you want to reject "${actionTarget?.profile.businessName}"?`,
      confirmLabel: "Reject",
      variant: "danger" as const,
    },
    suspend: {
      title: "Suspend Seller Profile",
      description: `Are you sure you want to suspend "${actionTarget?.profile.businessName}"?`,
      confirmLabel: "Suspend",
      variant: "warning" as const,
    },
  };

  return (
    <div>
      <AdminPageHeader
        title="Seller Profiles"
        subtitle="Management"
        description="Review and manage seller profile registrations."
      />

      <AdminActionBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search by business name...",
        }}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-admin-border bg-white px-3 text-sm text-admin-text outline-none transition focus:border-admin-accent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        }
        actions={
          <button
            type="button"
            onClick={() => loadProfiles()}
            className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-sm font-semibold text-admin-text transition hover:bg-slate-50"
          >
            Refresh
          </button>
        }
      />

      {loading ? (
        <AdminLoadingState label="Loading seller profiles..." />
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => loadProfiles()}
            className="mt-2 text-sm font-semibold text-red-600 underline"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title="No seller profiles found"
          description="Try adjusting your search or filter criteria."
          action={{ label: "Clear filters", onClick: () => { setSearch(""); setStatusFilter(""); } }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-admin-border bg-white">
          <table className="min-w-full divide-y divide-admin-border">
            <thead className="bg-admin-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Seller ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Business Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-admin-soft">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filtered.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-admin-muted">
                    {profile.userId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-admin-text">
                    {profile.businessName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-muted">
                    {profile.phone ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <AdminStatusBadge status={profile.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-muted">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {profile.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActionTarget({ profile, action: "approve" })}
                          className="mr-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setActionTarget({ profile, action: "reject" })}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {profile.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => setActionTarget({ profile, action: "suspend" })}
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

      {actionTarget && (
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
    </div>
  );
}
