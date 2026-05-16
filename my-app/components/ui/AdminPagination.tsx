import Link from "next/link";

function buildHref(basePath: string, page: number, query?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  if (page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

export function AdminPagination({
  basePath,
  page,
  limit,
  total,
  query,
}: {
  basePath: string;
  page: number;
  limit: number;
  total: number;
  query?: Record<string, string | number | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between gap-3 rounded-xl border border-admin-border bg-white px-4 py-3 text-sm">
      <span className="font-semibold text-admin-muted">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={buildHref(basePath, page - 1, query)} className="rounded-lg border border-admin-border px-3 py-2 font-bold text-admin-text">
            Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={buildHref(basePath, page + 1, query)} className="rounded-lg bg-admin-accent px-3 py-2 font-bold text-white">
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
