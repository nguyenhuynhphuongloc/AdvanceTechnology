import { StorefrontHeader } from "../storefront/StorefrontHeader";
import { PRODUCT_LIST_PATH } from "../../lib/products/routes";

interface ProductCatalogHeaderProps {
  search?: string;
  actionPath?: string;
}

export function ProductCatalogHeader({
  search = "",
  actionPath = PRODUCT_LIST_PATH,
}: ProductCatalogHeaderProps) {
  return <StorefrontHeader activeNav="products" searchQuery={search} searchAction={actionPath} />;
}
