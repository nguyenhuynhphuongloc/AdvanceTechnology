import { cookies } from "next/headers";
import { fetchAdminLogDetail, fetchAdminLogs } from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { AdminDataTable } from "@/components/ui/AdminDataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function levelTone(level: string) {
  if (level === "error") return "danger" as const;
  if (level === "warn") return "warning" as const;
  if (level === "info") return "success" as const;
  return "neutral" as const;
}

export default async function AdminLogsPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const params = await searchParams;
  const search = readParam(params, "search");
  const level = readParam(params, "level");
  const selected = readParam(params, "selected");
  const response = await fetchAdminLogs(token, { search, level: level ?? undefined }).catch(() => ({
    items: [],
    total: 0,
  }));
  const selectedItem =
    selected ? await fetchAdminLogDetail(token, selected).catch(() => null) : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-muted">System</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-admin-text">Logs</h1>
        <p className="mt-2 text-sm text-admin-muted">
          Browse operational log entries from the logging service through the admin gateway.
        </p>
      </div>

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]" action="/admin/logs">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search source or message..."
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        />
        <select
          name="level"
          defaultValue={level ?? ""}
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          <option value="">All levels</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
        </select>
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">Filter</button>
      </form>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdminDataTable
          rows={response.items}
          getRowKey={(item) => item.id}
          emptyTitle="No logs found"
          emptyDescription="Log entries will appear here once services publish operational logs."
          columns={[
            { key: "source", header: "Source", render: (item) => item.source },
            {
              key: "level",
              header: "Level",
              render: (item) => <StatusBadge tone={levelTone(item.level)}>{item.level}</StatusBadge>,
            },
            { key: "message", header: "Message", render: (item) => item.message },
            {
              key: "detail",
              header: "Detail",
              className: "text-right",
              render: (item) => (
                <a href={`/admin/logs?selected=${item.id}`} className="font-bold text-admin-accent">
                  Review
                </a>
              ),
            },
          ]}
        />

        <aside className="admin-surface h-fit p-5">
          <h2 className="text-lg font-black text-admin-text">Log detail</h2>
          {selectedItem ? (
            <div className="mt-4 space-y-3 text-sm text-admin-text">
              <p><span className="font-bold">Source:</span> {selectedItem.source}</p>
              <p><span className="font-bold">Level:</span> {selectedItem.level}</p>
              <p><span className="font-bold">Created:</span> {new Date(selectedItem.createdAt).toLocaleString()}</p>
              <pre className="overflow-x-auto rounded-xl border border-admin-border bg-admin-surface-muted p-3 text-xs text-admin-text">
                {JSON.stringify(selectedItem.metadata ?? {}, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="mt-4 text-sm text-admin-muted">Select a log entry to inspect its structured metadata.</p>
          )}
        </aside>
      </section>
    </div>
  );
}
