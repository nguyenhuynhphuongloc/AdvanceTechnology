"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const collections = [
  { name: "All", value: "all" },
  { name: "T-Shirts", value: "t-shirts" },
  { name: "Shirts", value: "shirts" },
  { name: "Trousers", value: "trousers" },
  { name: "Jackets", value: "jackets" },
  { name: "Hoodies", value: "hoodies" },
  { name: "Footwear", value: "footwear" },
  { name: "Accessories", value: "accessories" },
];

export function CollectionsSidebar() {
  const searchParams = useSearchParams();
  const currentCategory =
    searchParams.get("category")?.toLowerCase() ||
    searchParams.get("collection")?.toLowerCase() ||
    "all";
  const currentSearch = searchParams.get("search") || searchParams.get("q");
  const currentSort = searchParams.get("sort");

  const buildHref = (categoryValue: string) => {
    const params = new URLSearchParams();
    if (categoryValue !== "all") {
      params.set("category", categoryValue);
    }
    if (currentSearch) {
      params.set("search", currentSearch);
    }
    if (currentSort) {
      params.set("sort", currentSort);
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
      <h3 className="storefront-kicker">Collections</h3>
      <div className="storefront-panel" style={{ padding: 18 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {collections.map((collection) => {
            const isActive = currentCategory === collection.value;
            return (
              <li key={collection.value}>
                <Link
                  href={buildHref(collection.value)}
                  style={{
                    textDecoration: "none",
                    color: isActive ? "var(--foreground)" : "var(--text-muted)",
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    display: "block",
                    padding: "8px 0",
                  }}
                >
                  {collection.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
