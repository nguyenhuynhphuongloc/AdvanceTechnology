import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function AdminReportsPage() {
  const reportTypes = [
    {
      title: "User Reports",
      description: "Abuse, fraud, or suspicious account activity reported by users.",
      statuses: ["pending", "reviewing", "resolved", "rejected"],
      endpoint: "GET /api/v1/admin/reports/users",
    },
    {
      title: "Product Reports",
      description: "Products flagged for policy violations, counterfeit goods, or misleading content.",
      statuses: ["pending", "reviewing", "resolved", "rejected"],
      endpoint: "GET /api/v1/admin/reports/products",
    },
    {
      title: "Shop Reports",
      description: "Shops flagged for repeated policy violations or seller misconduct.",
      statuses: ["pending", "reviewing", "resolved", "rejected"],
      endpoint: "GET /api/v1/admin/reports/shops",
    },
    {
      title: "Order Disputes",
      description: "Buyer–seller disputes escalated to platform admin for resolution.",
      statuses: ["open", "in_review", "resolved", "closed"],
      endpoint: "GET /api/v1/admin/reports/disputes",
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        subtitle="Moderation"
        description="Platform-level reports and disputes submitted by users, buyers, and sellers."
      />

      {/* No API notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-800">Report API not yet implemented</p>
          <p className="mt-0.5 text-sm text-amber-700">
            No backend endpoints for platform reports exist. This page will list live reports once
            the API is available. No mock data is shown.
          </p>
        </div>
      </div>

      {/* Report types + required endpoints */}
      <div className="grid gap-4 sm:grid-cols-2">
        {reportTypes.map((rt) => (
          <div key={rt.title} className="admin-surface p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-admin-text">{rt.title}</h2>
                <p className="mt-0.5 text-xs text-admin-muted">{rt.description}</p>
              </div>
              <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                No API
              </span>
            </div>

            {/* Status chips */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {rt.statuses.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-admin-border bg-admin-surface-muted px-2 py-0.5 text-[10px] font-medium capitalize text-admin-soft"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Endpoint */}
            <div className="rounded-lg bg-admin-surface-muted p-2">
              <code className="text-[11px] font-mono text-admin-text">{rt.endpoint}</code>
            </div>
          </div>
        ))}
      </div>

      {/* Integration checklist */}
      <div className="admin-surface mt-5 p-5">
        <h2 className="mb-3 text-sm font-semibold text-admin-text">Integration Checklist</h2>
        <ul className="space-y-2 text-sm text-admin-muted">
          {[
            "Backend team implements report submission & CRUD endpoints",
            "Admin can view, filter, and change report status",
            "Notifications sent to reporters when status changes",
            "Reports linked to relevant user/product/shop record",
            "Audit log for every admin action on a report",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 h-3 w-3 shrink-0 rounded border-2 border-admin-border bg-white" />
              <span className="text-xs text-admin-text">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
