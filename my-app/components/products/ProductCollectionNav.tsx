import Link from "next/link";
import { buildProductListHref } from "../../lib/products/routes";

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
        const href = buildProductListHref({
          category: collection,
          search: currentSearch,
          sort: currentSort as
            | "latest"
            | "price-asc"
            | "price-desc"
            | "name-asc"
            | "name-desc"
            | undefined,
        });
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
