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
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        marginTop: 28,
      }}
    >
      <p style={{ margin: 0, color: "var(--text-muted)" }}>
        Page {page} of {totalPages}
      </p>

      <div className="storefront-link-list">
        {page > 1 ? (
          <Link
            href={buildHref(basePath, page - 1, query)}
            className="storefront-button storefront-button-secondary"
          >
            Previous
          </Link>
        ) : null}

        {visiblePages.map((current) => {
          const isActive = current === page;
          return (
            <Link
              key={current}
              href={buildHref(basePath, current, query)}
              className={`storefront-button ${
                isActive ? "storefront-button-primary" : "storefront-button-secondary"
              }`}
            >
              {current}
            </Link>
          );
        })}

        {page < totalPages ? (
          <Link
            href={buildHref(basePath, page + 1, query)}
            className="storefront-button storefront-button-secondary"
          >
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
