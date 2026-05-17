"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function SellersPage() {
  return (
    <div>
      <AdminPageHeader
        title="Sellers"
        subtitle="Users & Sellers"
        description="Manage all sellers on the platform."
      />
      <AdminEmptyState
        title="Backend API not yet implemented"
        description="The /api/v1/admin/sellers endpoint does not exist in the backend yet. This page will display the seller list once the backend team implements it. See Known Issues for details."
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        }
        action={{
          label: "View Known Issues",
          href: "/docs/phase-5-known-issues.md",
        }}
      />
    </div>
  );
}
