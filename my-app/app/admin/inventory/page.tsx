import { fetchAdminInventory } from "@/lib/admin/api";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";

export default async function AdminInventoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const { items: inventory } = await fetchAdminInventory(token).catch(() => ({ items: [] }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Inventory & Branches</h1>
          <p className="text-text-muted">Manage multi-branch inventory stock and store locations.</p>
        </div>
        <button className="px-6 py-3 bg-accent text-accent-contrast font-bold rounded-xl hover:bg-accent-strong transition-colors shadow-lg shadow-accent/20">
          Add Branch
        </button>
      </div>
      
      <div className="bg-surface border border-border-dim rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-dim bg-surface-muted/50 text-[11px] font-black uppercase tracking-wider text-text-soft">
              <th className="p-4 pl-6">Variant ID</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Branch ID</th>
              <th className="p-4">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dim">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-muted">
                  No inventory records found or unauthorized. Please log in as admin.
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="p-4 pl-6 text-xs font-mono text-text-muted">{item.variantId}</td>
                  <td className="p-4 text-sm font-bold text-foreground">{item.sku}</td>
                  <td className="p-4 text-xs font-mono text-text-muted">{item.branchId || 'Default'}</td>
                  <td className="p-4 text-sm font-bold tabular-nums">{item.stock}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
