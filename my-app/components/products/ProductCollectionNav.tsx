import Link from "next/link";

const collections = ["all", "jackets", "shirts", "hoodies", "footwear", "accessories"];

interface ProductCollectionNavProps {
    activeCategory?: string;
    currentSearch?: string;
    currentSort?: string;
}

export function ProductCollectionNav({
    activeCategory,
    currentSearch,
    currentSort,
}: ProductCollectionNavProps) {
    return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {collections.map((collection) => {
                const params = new URLSearchParams();
                if (collection !== "all") {
                    params.set("category", collection);
                }
                if (currentSearch) {
                    params.set("search", currentSearch);
                }
                if (currentSort && currentSort !== "latest") {
                    params.set("sort", currentSort);
                }

                const href = `/products${params.toString() ? `?${params.toString()}` : ""}`;
                const isActive = (activeCategory ?? "all") === collection;

                return (
                    <Link
                        key={collection}
                        href={href}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 999,
                            textDecoration: "none",
                            fontSize: 13,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            background: isActive ? "white" : "rgba(255,255,255,0.06)",
                            color: isActive ? "#111" : "rgba(255,255,255,0.82)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        {collection}
                    </Link>
                );
            })}
        </div>
    );
}
