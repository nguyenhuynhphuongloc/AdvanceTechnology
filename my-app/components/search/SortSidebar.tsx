"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductSort } from "../../lib/products/types";

const sortOptions: Array<{ name: string; value: ProductSort }> = [
  { name: "Latest arrivals", value: "latest" },
  { name: "Price: Low to high", value: "price-asc" },
  { name: "Price: High to low", value: "price-desc" },
  { name: "Name: A-Z", value: "name-asc" },
  { name: "Name: Z-A", value: "name-desc" },
];

export function SortSidebar() {
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get("sort") || "latest") as ProductSort;
  const currentSearch = searchParams.get("search") || searchParams.get("q");
  const currentCategory = searchParams.get("category") || searchParams.get("collection");

  const buildHref = (sortValue: ProductSort) => {
    const params = new URLSearchParams();
    if (currentCategory) {
      params.set("category", currentCategory);
    }
    if (currentSearch) {
      params.set("search", currentSearch);
    }
    if (sortValue !== "latest") {
      params.set("sort", sortValue);
    }

    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  };

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        position: "sticky",
        top: 96,
        alignSelf: "start",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h3 className="storefront-kicker">Sort by</h3>
      <div className="storefront-panel" style={{ padding: 18 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {sortOptions.map((option) => {
            const isActive = currentSort === option.value;
            return (
              <li key={option.value}>
                <Link
                  href={buildHref(option.value)}
                  style={{
                    textDecoration: "none",
                    color: isActive ? "var(--foreground)" : "var(--text-muted)",
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    display: "block",
                    padding: "8px 0",
                  }}
                >
                  {option.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
