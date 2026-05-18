"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAdminToken } from "@/components/admin/AdminSessionGate";
import {
  fetchAdminUserDetail,
  updateAdminUserStatus,
  updateAdminUserRole,
} from "@/lib/admin/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLoadingState from "@/components/admin/AdminLoadingState";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import type { AdminUserDetail } from "@/lib/admin/types";

const ROLES = ["customer", "seller", "admin"];

export default function UserDetailPage() {
  const params = useParams();
  const token = useAdminToken();
  const userId = params.id as string;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadUser = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUserDetail(token, userId);
      setUser(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load user";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (token) loadUser();
  }, [token, loadUser]);

  const handleStatusToggle = async () => {
    if (!token || !user) return;
    setActionLoading(true);
    try {
      await updateAdminUserStatus(token, userId, { isActive: !user.isActive });
      setShowStatusDialog(false);
      await loadUser();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!token || !user) return;
    setActionLoading(true);
    try {
      await updateAdminUserRole(token, userId, { role: selectedRole });
      setShowRoleDialog(false);
      await loadUser();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <AdminLoadingState label="Loading user..." />;

  if (error || !user) {
    return (
      <div>
        <AdminPageHeader title="User Detail" subtitle="Users & Sellers" />
        <AdminEmptyState
          title="User not found"
          description={error ?? "The requested user could not be found."}
          action={{ label: "Back to Users", href: "/admin/users" }}
        />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={user.name || user.email}
        subtitle="Users & Sellers"
        description="View and manage user account details."
        actions={
          <button
            type="button"
            onClick={() => loadUser()}
            className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-sm font-semibold text-admin-text transition hover:bg-slate-50"
          >
            Refresh
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Info */}
        <div className="rounded-xl border border-admin-border bg-white p-6">
          <h2 className="mb-4 text-base font-bold text-admin-text">Account Information</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-admin-muted">Email</dt>
              <dd className="text-sm font-medium text-admin-text">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-admin-muted">Name</dt>
              <dd className="text-sm font-medium text-admin-text">{user.name || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-admin-muted">Status</dt>
              <dd>
                <AdminStatusBadge status={user.isActive ? "active" : "inactive"} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-admin-muted">Role</dt>
              <dd className="text-sm font-medium capitalize text-admin-text">{user.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-admin-muted">Created</dt>
              <dd className="text-sm font-medium text-admin-text">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-admin-muted">Last Updated</dt>
              <dd className="text-sm font-medium text-admin-text">
                {new Date(user.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Actions */}
        <div className="rounded-xl border border-admin-border bg-white p-6">
          <h2 className="mb-4 text-base font-bold text-admin-text">Account Actions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-admin-border p-3">
              <div>
                <p className="text-sm font-semibold text-admin-text">
                  {user.isActive ? "Deactivate Account" : "Activate Account"}
                </p>
                <p className="text-xs text-admin-muted">
                  {user.isActive
                    ? "Prevent the user from logging in."
                    : "Allow the user to log in again."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusDialog(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition ${
                  user.isActive
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {user.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-admin-border p-3">
              <div>
                <p className="text-sm font-semibold text-admin-text">Change Role</p>
                <p className="text-xs text-admin-muted">
                  Current: <span className="capitalize">{user.role}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole(user.role);
                  setShowRoleDialog(true);
                }}
                className="rounded-lg bg-admin-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                Change Role
              </button>
            </div>
          </div>
        </div>
      </div>

      <AdminConfirmDialog
        open={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={handleStatusToggle}
        title={user.isActive ? "Deactivate User" : "Activate User"}
        description={
          user.isActive
            ? `Deactivate "${user.name || user.email}"? They will not be able to log in.`
            : `Activate "${user.name || user.email}"? They will regain access.`
        }
        confirmLabel={user.isActive ? "Deactivate" : "Activate"}
        variant={user.isActive ? "warning" : "info"}
        loading={actionLoading}
      />

      {showRoleDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-admin-border bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-admin-text">Change User Role</h2>
            <div className="mb-4 space-y-2">
              {ROLES.map((role) => (
                <label key={role} className="flex cursor-pointer items-center gap-3 rounded-lg border border-admin-border p-3 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="h-4 w-4 accent-admin-accent"
                  />
                  <span className="text-sm font-medium capitalize text-admin-text">{role}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRoleDialog(false)}
                className="rounded-lg border border-admin-border bg-white px-4 py-2 text-sm font-semibold text-admin-text transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRoleChange}
                disabled={actionLoading || selectedRole === user.role}
                className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
