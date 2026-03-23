import type { ProductCardDto, ProductSort } from "./types";
import type { Product } from "../search/types";

const validSorts: ProductSort[] = ["latest", "price-asc", "price-desc", "name-asc", "name-desc"];

export function toStorefrontProduct(product: ProductCardDto): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.basePrice,
    imageUrl: product.imageUrl,
    category: product.category,
  };
}

export function normalizeCatalogSort(value?: string): ProductSort {
  return value && validSorts.includes(value as ProductSort) ? (value as ProductSort) : "latest";
}

export function normalizeSearchQuery(params: Record<string, string | string[] | undefined>) {
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const rawSearch = Array.isArray(params.search) ? params.search[0] : params.search;
  const rawLegacySearch = Array.isArray(params.q) ? params.q[0] : params.q;
  const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const rawCollection = Array.isArray(params.collection) ? params.collection[0] : params.collection;
  const rawSort = Array.isArray(params.sort) ? params.sort[0] : params.sort;

  const pageNumber = Number(rawPage ?? "1");
  return {
    page: Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1,
    search: rawSearch || rawLegacySearch || undefined,
    category: rawCategory || rawCollection || undefined,
    sort: normalizeCatalogSort(rawSort),
  };
}
