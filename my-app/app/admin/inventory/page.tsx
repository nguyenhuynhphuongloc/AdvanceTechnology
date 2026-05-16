import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createAdminBranch,
  deleteAdminBranch,
  fetchAdminBranches,
  fetchAdminInventory,
  updateAdminBranch,
  updateInventoryQuantity,
} from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { AdminDataTable } from "@/components/ui/AdminDataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
}

async function updateInventoryAction(formData: FormData) {
  "use server";

  const token = await getAdminToken();
  await updateInventoryQuantity(token, String(formData.get("id") ?? ""), Number(formData.get("stock") ?? 0));
  revalidatePath("/admin/inventory");
}

async function createBranchAction(formData: FormData) {
  "use server";

  const token = await getAdminToken();
  await createAdminBranch(token, {
    name: String(formData.get("name") ?? ""),
    location: String(formData.get("location") ?? ""),
    isActive: formData.get("isActive") === "on",
  });
  revalidatePath("/admin/inventory");
}

async function updateBranchAction(formData: FormData) {
  "use server";

  const token = await getAdminToken();
  await updateAdminBranch(token, String(formData.get("id") ?? ""), {
    name: String(formData.get("name") ?? ""),
    location: String(formData.get("location") ?? ""),
    isActive: formData.get("isActive") === "on",
  });
  revalidatePath("/admin/inventory");
}

async function deleteBranchAction(formData: FormData) {
  "use server";

  const token = await getAdminToken();
  await deleteAdminBranch(token, String(formData.get("id") ?? ""));
  revalidatePath("/admin/inventory");
}

function stockTone(status: string) {
  if (status === "in-stock") return "success" as const;
  if (status === "low-stock") return "warning" as const;
  return "danger" as const;
}

export default async function AdminInventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const params = await searchParams;
  const sku = readParam(params, "sku");
  const branchId = readParam(params, "branchId");
  const [{ items: inventory }, branchesResponse] = await Promise.all([
    fetchAdminInventory(token, { sku: sku ?? undefined, branchId: branchId ?? undefined }).catch(() => ({ items: [] })),
    fetchAdminBranches(token).catch(() => ({ items: [], total: 0 })),
  ]);
  const branches = branchesResponse.items;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Catalog</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Inventory & Branches</h1>
          <p className="mt-2 text-sm text-admin-muted">Manage stock by variant and branch without moving inventory ownership into products.</p>
        </div>
      </div>

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px_auto]" action="/admin/inventory">
        <input
          name="sku"
          defaultValue={sku ?? ""}
          placeholder="Filter by SKU..."
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <select
          name="branchId"
          defaultValue={branchId ?? ""}
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          <option value="">All branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">Filter</button>
      </form>

      <AdminDataTable
        rows={inventory}
        getRowKey={(item) => item.id}
        emptyTitle="No inventory records"
        emptyDescription="Inventory records will appear after product variants are assigned stock."
        columns={[
          { key: "variant", header: "Variant ID", render: (item) => <span className="font-mono text-xs">{item.variantId}</span> },
          { key: "sku", header: "SKU", render: (item) => item.sku ?? "Unassigned" },
          {
            key: "branch",
            header: "Branch",
            render: (item) => branches.find((branch) => branch.id === item.branchId)?.name ?? item.branchId ?? "Default",
          },
          {
            key: "stock",
            header: "Stock",
            render: (item) => (
              <form action={updateInventoryAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={item.id} />
                <input
                  type="number"
                  name="stock"
                  min={0}
                  defaultValue={item.stock}
                  className="w-24 rounded-lg border border-admin-border bg-white px-2 py-1 text-sm"
                />
                <button className="rounded-lg bg-slate-950 px-2 py-1 text-xs font-bold text-white">Save</button>
              </form>
            ),
          },
          { key: "available", header: "Available", render: (item) => item.availableStock },
          { key: "status", header: "Status", render: (item) => <StatusBadge tone={stockTone(item.status)}>{item.status}</StatusBadge> },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <form action={createBranchAction} className="admin-surface space-y-4 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-admin-muted">Branches</p>
            <h2 className="mt-2 text-lg font-black text-admin-text">Add branch</h2>
          </div>
          <input
            name="name"
            required
            placeholder="Branch name"
            className="w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm"
          />
          <input
            name="location"
            placeholder="Location"
            className="w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm font-medium text-admin-text">
            <input type="checkbox" name="isActive" defaultChecked />
            Active branch
          </label>
          <button className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white">
            Create branch
          </button>
        </form>

        <div className="admin-surface space-y-4 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-admin-muted">Branch records</p>
            <h2 className="mt-2 text-lg font-black text-admin-text">Manage branches</h2>
          </div>
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch.id} className="rounded-xl border border-admin-border bg-admin-surface-muted p-4">
                <form action={updateBranchAction} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                  <input type="hidden" name="id" value={branch.id} />
                  <input name="name" defaultValue={branch.name} className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm" />
                  <input name="location" defaultValue={branch.location ?? ""} className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm" />
                  <label className="flex items-center gap-2 text-sm font-medium text-admin-text">
                    <input type="checkbox" name="isActive" defaultChecked={branch.isActive} />
                    Active
                  </label>
                  <button className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white">Save</button>
                </form>
                <form action={deleteBranchAction} className="mt-3">
                  <input type="hidden" name="id" value={branch.id} />
                  <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
