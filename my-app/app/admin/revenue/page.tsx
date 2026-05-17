import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Link from "next/link";

export default function AdminRevenuePage() {
  return (
    <div>
      <AdminPageHeader
        title="Platform Revenue"
        subtitle="Finance"
        description="Platform-level earnings separate from seller shop revenue."
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
          <p className="text-sm font-semibold text-amber-800">Backend API not available</p>
          <p className="mt-0.5 text-sm text-amber-700">
            No dedicated endpoint exists for platform-level revenue calculation yet.
            See the missing API checklist for the required endpoint specification.
          </p>
        </div>
      </div>

      {/* Definition card */}
      <div className="admin-surface mb-5 p-5">
        <h2 className="mb-3 text-sm font-semibold text-admin-text">What is Platform Revenue?</h2>
        <p className="text-sm text-admin-muted leading-relaxed">
          Platform revenue is the share the marketplace earns from each transaction — typically a
          commission percentage applied to every completed seller order. This is distinct from total
          gross merchandise value (GMV) or individual seller earnings.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Commission Revenue", note: "% of each settled order — API missing" },
            { label: "Subscription Fees", note: "Seller plan fees — API missing" },
            { label: "Listing Fees", note: "Per-product charges — API missing" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-dashed border-admin-border bg-admin-surface-muted p-4"
            >
              <p className="text-xs font-semibold text-admin-text">{item.label}</p>
              <p className="mt-1 text-xs text-amber-600">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Missing API checklist */}
      <div className="admin-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-admin-text">Required Backend Endpoints</h2>
        <ul className="space-y-2 text-sm text-admin-muted">
          {[
            "GET /api/v1/admin/revenue/summary — total platform earnings, period filter",
            "GET /api/v1/admin/revenue/commissions — per-order commission breakdown",
            "GET /api/v1/admin/revenue/timeline — revenue over time (daily / monthly)",
          ].map((endpoint) => (
            <li key={endpoint} className="flex items-start gap-2">
              <span className="mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 border-amber-400 bg-white" />
              <code className="font-mono text-xs text-admin-text">{endpoint}</code>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-admin-border pt-4">
          <p className="text-xs text-admin-soft">
            Currency must be VND (₫). Once endpoints are available, integrate them and remove
            this empty state.
          </p>
          <Link
            href="/admin/commissions"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-sm font-semibold text-admin-text transition hover:border-admin-accent hover:text-admin-accent"
          >
            View Commissions page →
          </Link>
        </div>
      </div>
    </div>
  );
}
