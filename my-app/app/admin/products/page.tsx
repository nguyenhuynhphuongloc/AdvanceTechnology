import Link from "next/link";
import { cookies } from "next/headers";
import { fetchAdminProducts } from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { AdminDataTable } from "@/components/ui/AdminDataTable";
import { ProductImageFrame } from "@/components/ui/ProductImageFrame";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminPagination } from "@/components/ui/AdminPagination";
import type { AdminProductCard } from "@/lib/admin/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const params = await searchParams;
  const search = readParam(params, "search");
  const status = readParam(params, "status") as "all" | "active" | "inactive" | undefined;
  const page = Number(readParam(params, "page") ?? "1");
  const response = await fetchAdminProducts(token, {
    limit: 20,
    page: Number.isFinite(page) ? page : 1,
    search,
    status: status ?? "all",
  }).catch(() => ({ items: [] as AdminProductCard[], total: 0, page: 1, limit: 20 }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Catalog</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Products</h1>
          <p className="mt-2 text-sm text-admin-muted">{response.total} product records</p>
        </div>
        <Link href="/admin/products?mode=create" className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white">
          Add product
        </Link>
      </div>

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]" action="/admin/products">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search product name, slug, SKU..."
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <select
          name="status"
          defaultValue={status ?? "all"}
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">Filter</button>
      </form>

      <AdminDataTable
        rows={response.items}
        getRowKey={(product) => product.id}
        emptyTitle="No products found"
        emptyDescription="Create products in Admin or adjust your filters."
        columns={[
          {
            key: "product",
            header: "Product",
            render: (product) => (
              <div className="flex items-center gap-3">
                <ProductImageFrame src={product.imageUrl} alt={product.name} className="h-12 w-12" imageClassName="p-1" />
                <div className="min-w-0">
                  <p className="truncate font-bold text-admin-text">{product.name}</p>
                  <p className="truncate font-mono text-xs text-admin-muted">{product.slug}</p>
                </div>
              </div>
            ),
          },
          { key: "sku", header: "SKU", render: (product) => <span className="font-mono text-xs">{product.sku}</span> },
          { key: "category", header: "Category", render: (product) => product.category },
          {
            key: "status",
            header: "Status",
            render: (product) => (
              <StatusBadge tone={product.isActive ? "success" : "neutral"}>
                {product.isActive ? "Active" : "Draft"}
              </StatusBadge>
            ),
          },
          { key: "price", header: "Base price", className: "text-right", render: (product) => formatPrice(product.basePrice) },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            render: (product) => (
              <Link href={`/admin/products?selected=${product.id}`} className="font-bold text-admin-accent">
                Review
              </Link>
            ),
          },
        ]}
      />

      <AdminPagination
        basePath="/admin/products"
        page={response.page}
        limit={response.limit}
        total={response.total}
        query={{ search, status }}
      />
    </div>
  );
}
