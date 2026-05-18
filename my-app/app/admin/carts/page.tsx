import { cookies } from "next/headers";
import { fetchAdminCartDetail, fetchAdminCarts } from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { AdminDataTable } from "@/components/ui/AdminDataTable";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default async function AdminCartsPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const params = await searchParams;
  const search = readParam(params, "search");
  const userId = readParam(params, "user");
  const selected = readParam(params, "selected");

  const response = await fetchAdminCarts(token, { search, userId: userId ?? undefined }).catch(() => ({
    items: [],
    total: 0,
  }));
  const selectedCart =
    selected ? await fetchAdminCartDetail(token, selected).catch(() => null) : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Commerce</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Carts</h1>
        <p className="mt-2 text-sm text-admin-muted">
          Support view into user and guest cart state without editing checkout data directly.
        </p>
      </div>

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px_auto]" action="/admin/carts">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search user id, guest token, or owner key..."
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <input
          name="user"
          defaultValue={userId ?? ""}
          placeholder="Filter by user id"
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">Filter</button>
      </form>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdminDataTable
          rows={response.items}
          getRowKey={(cart) => cart.id}
          emptyTitle="No carts found"
          emptyDescription="Carts will appear once users or guests add items."
          columns={[
            {
              key: "owner",
              header: "Owner",
              render: (cart) => (
                <div>
                  <p className="font-bold text-admin-text">{cart.userId ?? "Guest cart"}</p>
                  <p className="font-mono text-xs text-admin-muted">{cart.guestToken ?? cart.ownerKey}</p>
                </div>
              ),
            },
            { key: "items", header: "Items", render: (cart) => cart.itemCount },
            {
              key: "subtotal",
              header: "Subtotal",
              className: "text-right",
              render: (cart) => formatMoney(cart.subtotal),
            },
            {
              key: "detail",
              header: "Detail",
              className: "text-right",
              render: (cart) => (
                <a href={`/admin/carts?selected=${cart.id}`} className="font-bold text-admin-accent">
                  Review
                </a>
              ),
            },
          ]}
        />

        <aside className="admin-surface h-fit p-5">
          <h2 className="text-lg font-black text-admin-text">Cart detail</h2>
          {selectedCart ? (
            <div className="mt-4 space-y-3">
              {selectedCart.items.length === 0 ? (
                <p className="text-sm text-admin-muted">This cart is currently empty.</p>
              ) : (
                selectedCart.items.map((item) => (
                  <div key={item.variantId} className="rounded-xl border border-admin-border bg-admin-surface-muted p-3">
                    <p className="font-mono text-xs text-admin-muted">{item.variantId}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>Qty {item.quantity}</span>
                      <span>{formatMoney(item.unitPrice)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-admin-muted">Select a cart to inspect its line items.</p>
          )}
        </aside>
      </section>
    </div>
  );
}
