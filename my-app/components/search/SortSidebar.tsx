"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SortOption } from "../../lib/search/types";

const sortOptions: { name: string; value: SortOption }[] = [
    { name: "Relevance", value: "relevance" },
    { name: "Trending", value: "trending" },
    { name: "Latest arrivals", value: "latest" },
    { name: "Price: Low to high", value: "price-asc" },
    { name: "Price: High to low", value: "price-desc" },
];

export function SortSidebar() {
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "relevance";
    const currentQ = searchParams.get("q");
    const currentCollection = searchParams.get("collection");

    const buildHref = (sortValue: string) => {
        const params = new URLSearchParams();
        if (currentCollection) params.set("collection", currentCollection);
        if (currentQ) params.set("q", currentQ);
        if (sortValue !== "relevance") {
            params.set("sort", sortValue);
        }

        const qs = params.toString();
        return `/search${qs ? `?${qs}` : ""}`;
    };

    return (
        <aside style={{
            width: 200,
            flexShrink: 0,
            position: "sticky",
            top: 84,
            alignSelf: "start",
            display: "flex",
            flexDirection: "column",
            gap: 16
        }}>
            <h3 style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>
                Sort by
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {sortOptions.map((opt) => {
                    const isActive = currentSort === opt.value;
                    return (
                        <li key={opt.value}>
                            <Link
                                href={buildHref(opt.value)}
                                style={{
                                    textDecoration: "none",
                                    color: isActive ? "white" : "rgba(255,255,255,0.6)",
                                    fontSize: 14,
                                    fontWeight: isActive ? 500 : 400,
                                    display: "inline-block",
                                    transition: "color 0.2s"
                                }}
                                className="sidebar-link"
                            >
                                {opt.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
