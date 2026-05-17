"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function CommissionsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Commissions"
        subtitle="Finance"
        description="Track platform commissions and seller earnings."
      />
      <AdminEmptyState
        title="Commission tracking coming soon"
        description="The commission tracking feature is currently under development. Once the commission calculation system is implemented, this page will display platform commissions and seller earnings breakdowns."
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        }
      />
    </div>
  );
}
