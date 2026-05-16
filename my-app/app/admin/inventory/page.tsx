import { cookies } from "next/headers";
import { fetchAdminInventory } from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { AdminDataTable } from "@/components/ui/AdminDataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

function stockTone(status: string) {
  if (status === "in-stock") return "success" as const;
  if (status === "low-stock") return "warning" as const;
  return "danger" as const;
}

export default async function AdminInventoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const { items: inventory } = await fetchAdminInventory(token).catch(() => ({ items: [] }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Catalog</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Inventory & Branches</h1>
          <p className="mt-2 text-sm text-admin-muted">Manage multi-branch stock records when backend branch workflows are available.</p>
        </div>
        <button disabled className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold text-slate-500">
          Add branch API pending
        </button>
      </div>

      <AdminDataTable
        rows={inventory}
        getRowKey={(item) => item.id}
        emptyTitle="No inventory records"
        emptyDescription="Inventory records will appear after product variants are assigned stock."
        columns={[
          { key: "variant", header: "Variant ID", render: (item) => <span className="font-mono text-xs">{item.variantId}</span> },
          { key: "sku", header: "SKU", render: (item) => item.sku ?? "Unassigned" },
          { key: "branch", header: "Branch", render: (item) => item.branchId ?? "Default" },
          { key: "stock", header: "Stock", render: (item) => item.stock },
          { key: "available", header: "Available", render: (item) => item.availableStock },
          { key: "status", header: "Status", render: (item) => <StatusBadge tone={stockTone(item.status)}>{item.status}</StatusBadge> },
        ]}
      />
    </div>
  );
}
