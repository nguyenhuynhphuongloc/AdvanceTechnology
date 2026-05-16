import { fetchAdminProducts } from "@/lib/admin/api";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import Link from "next/link";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default async function AdminProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const { items: products } = await fetchAdminProducts(token, { limit: 50 }).catch(() => ({ items: [] as any[] }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Products</h1>
          <p className="text-text-muted">Manage your catalog, variants, and pricing. <span className="font-mono text-text-soft text-xs">({products.length} items)</span></p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-6 py-3 bg-accent text-accent-contrast font-bold rounded-xl hover:bg-accent-strong transition-colors shadow-lg shadow-accent/20"
        >
          Add Product
        </Link>
      </div>
      
      <div className="bg-surface border border-border-dim rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-dim bg-surface-muted/50 text-[11px] font-black uppercase tracking-wider text-text-soft">
              <th className="p-4 pl-6">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Base Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dim">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  No products found. Please log in as admin or add products to your catalog.
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr key={product.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900/50 flex items-center justify-center p-1 border border-border-dim overflow-hidden">
                        <img 
                          src={product.imageUrl || `https://picsum.photos/seed/${product.slug}/800/800`} 
                          alt={product.name}
                          className="w-full h-full object-contain drop-shadow-sm"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{product.name}</span>
                        <span className="text-[10px] text-text-soft font-mono">{product.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold font-mono text-text-muted">{product.sku}</td>
                  <td className="p-4 text-[10px] font-black uppercase tracking-widest text-text-soft">{product.category}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? "bg-success" : "bg-text-soft"}`} />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-text-soft">
                        {product.isActive ? "Active" : "Draft"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right pr-6 font-black tabular-nums text-foreground">{formatPrice(product.basePrice)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
