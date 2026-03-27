import type { ProductSort } from "./types";

type CatalogQuery = {
  page?: number;
  search?: string;
  category?: string;
  sort?: ProductSort;
};

export const PRODUCT_LIST_PATH = "/product";
export const LEGACY_PRODUCT_LIST_PATH = "/products";

export function buildProductListHref({
  page,
  search,
  category,
  sort,
}: CatalogQuery = {}) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (category && category !== "all") {
    params.set("category", category);
  }

  if (sort && sort !== "latest") {
    params.set("sort", sort);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${PRODUCT_LIST_PATH}?${queryString}` : PRODUCT_LIST_PATH;
}

export function buildProductDetailHref(slug: string) {
  return `${PRODUCT_LIST_PATH}/${slug}`;
}
