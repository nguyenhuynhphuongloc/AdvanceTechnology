"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function AdminAdminsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Admins"
        subtitle="Users & Sellers"
        description="Manage admin accounts and their access levels on the platform."
      />
      <AdminEmptyState
        title="Admin management coming soon"
        description="The admin account management feature is currently under development. This page will allow you to create, view, and manage admin accounts with role-based access controls."
        icon={
          <svg
            className="h-10 w-10 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      <div className="mx-auto mt-2 max-w-lg rounded-xl border border-admin-border bg-admin-surface-muted p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-admin-muted">Required backend endpoints</p>
        <ul className="mt-3 space-y-1.5">
          {[
            "GET /api/v1/admin/admins — list all admin accounts",
            "POST /api/v1/admin/admins — create new admin account",
            "PATCH /api/v1/admin/admins/:id — update admin account",
            "DELETE /api/v1/admin/admins/:id — deactivate admin account",
            "GET /api/v1/admin/admins/:id — get admin details",
          ].map((ep) => (
            <li key={ep} className="flex items-start gap-2 text-xs text-admin-muted">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span className="font-mono">{ep}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
