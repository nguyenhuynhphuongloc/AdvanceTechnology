"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function RefundsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Refunds"
        subtitle="Finance"
        description="Process and manage refund requests."
      />
      <AdminEmptyState
        title="Refund management coming soon"
        description="The refund management feature is currently under development. Once the backend refund API is implemented, this page will allow you to view and process refund requests."
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
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        }
      />
    </div>
  );
}
