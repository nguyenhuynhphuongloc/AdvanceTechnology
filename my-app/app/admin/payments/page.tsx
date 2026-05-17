import { cookies } from "next/headers";
import { fetchAdminPaymentDetail, fetchAdminPayments } from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { AdminDataTable } from "@/components/ui/AdminDataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

function paymentTone(status: string) {
  if (status === "success") return "success" as const;
  if (status === "failed") return "danger" as const;
  if (status === "pending") return "warning" as const;
  return "neutral" as const;
}

export default async function AdminPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const params = await searchParams;
  const search = readParam(params, "search");
  const status = readParam(params, "status");
  const selected = readParam(params, "selected");

  const response = await fetchAdminPayments(token, { search, status: status ?? undefined }).catch(() => ({
    items: [],
    total: 0,
  }));
  const selectedPayment =
    selected ? await fetchAdminPaymentDetail(token, selected).catch(() => null) : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">Commerce</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Payments</h1>
        <p className="mt-2 text-sm text-admin-muted">
          Review payment transactions and gateway references from the payment service.
        </p>
      </div>

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]" action="/admin/payments">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search order id, method, or gateway ref..."
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">Filter</button>
      </form>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdminDataTable
          rows={response.items}
          getRowKey={(payment) => payment.id}
          emptyTitle="No payment records"
          emptyDescription="Payment transactions will appear here after checkout payment intents are created."
          columns={[
            { key: "order", header: "Order", render: (payment) => payment.orderId },
            { key: "method", header: "Method", render: (payment) => payment.method },
            {
              key: "status",
              header: "Status",
              render: (payment) => (
                <StatusBadge tone={paymentTone(payment.status)}>{payment.status}</StatusBadge>
              ),
            },
            {
              key: "amount",
              header: "Amount",
              className: "text-right",
              render: (payment) => formatMoney(Number(payment.amount)),
            },
            {
              key: "links",
              header: "Detail",
              className: "text-right",
              render: (payment) => (
                <a href={`/admin/payments?selected=${payment.id}`} className="font-bold text-admin-accent">
                  Review
                </a>
              ),
            },
          ]}
        />

        <aside className="admin-surface h-fit p-5">
          <h2 className="text-lg font-black text-admin-text">Payment detail</h2>
          {selectedPayment ? (
            <dl className="mt-4 grid gap-3 text-sm text-admin-text">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-admin-muted">Order</dt>
                <dd className="mt-1 font-mono">{selectedPayment.orderId}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-admin-muted">Gateway ref</dt>
                <dd className="mt-1 break-all font-mono text-xs">{selectedPayment.gatewayRef ?? "Unavailable"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-admin-muted">Status</dt>
                <dd className="mt-1">{selectedPayment.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-admin-muted">Created</dt>
                <dd className="mt-1">{new Date(selectedPayment.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-admin-muted">
              Select a payment record to inspect gateway references and timing.
            </p>
          )}
        </aside>
      </section>
    </div>
  );
}
