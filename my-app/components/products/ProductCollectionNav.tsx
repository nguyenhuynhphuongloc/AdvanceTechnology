import Link from "next/link";

const collections = ["all", "t-shirts", "shirts", "trousers", "jackets", "hoodies", "footwear", "accessories"];

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
    <div className="storefront-link-list">
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
            className={`storefront-button ${isActive ? "storefront-button-primary" : "storefront-button-secondary"}`}
          >
            {collection}
          </Link>
        );
      })}
    </div>
  );
}
