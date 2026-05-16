import { fetchProducts } from "./api";
import { normalizeSearchQuery, toStorefrontProduct } from "./storefront";

type RawSearchParams = Record<string, string | string[] | undefined>;

export async function fetchCatalogPage(
  rawSearchParams: RawSearchParams,
  options?: { limit?: number },
) {
  const params = normalizeSearchQuery(rawSearchParams);
  try {
    const response = await fetchProducts({
      page: params.page,
      limit: options?.limit ?? 12,
      search: params.search,
      category: params.category,
      sort: params.sort,
    });

    return {
      params,
      response,
      products: response.items.map(toStorefrontProduct),
    };
  } catch (error) {
    return {
      params,
      response: { items: [], total: 0, page: params.page, limit: options?.limit ?? 12, pages: 0 },
      products: [],
    };
  }
}
