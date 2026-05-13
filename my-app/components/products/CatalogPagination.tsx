import Link from "next/link";

type CatalogPaginationProps = {
  basePath: string;
  page: number;
  limit: number;
  total: number;
  query?: Record<string, string | number | undefined>;
};

function buildHref(
  basePath: string,
  page: number,
  query?: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

export function CatalogPagination({
  basePath,
  page,
  limit,
  total,
  query,
}: CatalogPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = [];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, page + 1);
  for (let current = start; current <= end; current += 1) {
    visiblePages.push(current);
  }

  return (
    <nav
      aria-label="Catalog pagination"
      className="flex flex-col items-center gap-6"
    >
      <p className="m-0 text-[10px] font-black uppercase tracking-[0.2em] text-text-soft">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(basePath, page - 1, query)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-border-dim bg-white/5 px-6 text-xs font-black uppercase tracking-widest text-foreground transition-all hover:border-border-strong hover:bg-white/10 hover:-translate-y-0.5"
          >
            Prev
          </Link>
        ) : null}

        <div className="flex items-center gap-2 px-4">
          {visiblePages.map((current) => {
            const isActive = current === page;
            if (isActive) {
              return (
                <span
                  key={current}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xs font-black text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                >
                  {current}
                </span>
              );
            }
            return (
              <Link
                key={current}
                href={buildHref(basePath, current, query)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border-dim bg-white/5 text-xs font-black text-text-muted transition-all hover:border-border-strong hover:bg-white/10 hover:text-foreground hover:-translate-y-0.5"
              >
                {current}
              </Link>
            );
          })}
        </div>

        {page < totalPages ? (
          <Link
            href={buildHref(basePath, page + 1, query)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-border-dim bg-white/5 px-6 text-xs font-black uppercase tracking-widest text-foreground transition-all hover:border-border-strong hover:bg-white/10 hover:-translate-y-0.5"
          >
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

