"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const collections = [
    { name: "All", value: "all" },
    { name: "Bags", value: "bags" },
    { name: "Drinkware", value: "drinkware" },
    { name: "Electronics", value: "electronics" },
    { name: "Footwear", value: "footwear" },
    { name: "Headwear", value: "headwear" },
    { name: "Hoodies", value: "hoodies" },
    { name: "Jackets", value: "jackets" },
    { name: "Kids", value: "kids" },
    { name: "Pets", value: "pets" },
    { name: "Shirts", value: "shirts" },
    { name: "Stickers", value: "stickers" },
];

export function CollectionsSidebar() {
    const searchParams = useSearchParams();
    const currentCollection = searchParams.get("collection")?.toLowerCase() || "all";
    const currentQ = searchParams.get("q");
    const currentSort = searchParams.get("sort");

    const buildHref = (collectionValue: string) => {
        const params = new URLSearchParams();
        if (collectionValue !== "all") {
            params.set("collection", collectionValue);
        }
        if (currentQ) params.set("q", currentQ);
        if (currentSort) params.set("sort", currentSort);

        const qs = params.toString();
        return `/search${qs ? `?${qs}` : ""}`;
    };

    return (
        <aside style={{
            width: 220,
            flexShrink: 0,
            position: "sticky",
            top: 84, // header (60) + padding (24)
            alignSelf: "start",
            display: "flex",
            flexDirection: "column",
            gap: 16
        }}>
            <h3 style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>
                Collections
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {collections.map((col) => {
                    const isActive = currentCollection === col.value;
                    return (
                        <li key={col.value}>
                            <Link
                                href={buildHref(col.value)}
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
                                {col.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <style jsx global>{`
                .sidebar-link:hover {
                    color: white !important;
                }
            `}</style>
        </aside>
    );
}
