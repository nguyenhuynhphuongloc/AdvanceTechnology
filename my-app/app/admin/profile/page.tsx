"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useAdminSession } from "@/components/admin/AdminSessionGate";

export default function AdminProfilePage() {
  const { user } = useAdminSession();

  const initial = (user?.email ?? "A").charAt(0).toUpperCase();

  return (
    <div>
      <AdminPageHeader
        title="My Profile"
        subtitle="Profile"
        description="Your admin account details and session information."
      />

      <div className="mt-6 max-w-lg space-y-4">
        <div className="admin-surface flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-admin-accent text-xl font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-admin-text">{user?.email ?? "—"}</p>
            <p className="mt-0.5 text-sm text-admin-muted capitalize">{user?.role ?? "admin"}</p>
          </div>
        </div>

        <div className="admin-surface divide-y divide-admin-border">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-admin-muted">Email</span>
            <span className="text-sm font-semibold text-admin-text">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-admin-muted">Role</span>
            <span className="rounded-full bg-admin-accent-soft px-2.5 py-0.5 text-xs font-semibold capitalize text-admin-accent">
              {user?.role ?? "admin"}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-admin-muted">Session</span>
            <span className="text-sm font-semibold text-green-600">Active</span>
          </div>
        </div>

        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Profile editing is not yet available. Contact your system administrator to update account details.
        </p>
      </div>
    </div>
  );
}
