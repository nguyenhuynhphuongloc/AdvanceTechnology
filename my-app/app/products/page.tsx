import { redirect } from "next/navigation";
import { buildProductListHref } from "../../lib/products/routes";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LegacyProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const rawSearch = Array.isArray(params.search) ? params.search[0] : params.search;
  const rawLegacySearch = Array.isArray(params.q) ? params.q[0] : params.q;
  const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const rawCollection = Array.isArray(params.collection) ? params.collection[0] : params.collection;
  const rawSort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const page = Number(rawPage);

  redirect(
    buildProductListHref({
      page: Number.isFinite(page) && page > 1 ? page : undefined,
      search: rawSearch || rawLegacySearch || undefined,
      category: rawCategory || rawCollection || undefined,
      sort:
        rawSort === "latest" ||
        rawSort === "price-asc" ||
        rawSort === "price-desc" ||
        rawSort === "name-asc" ||
        rawSort === "name-desc"
          ? rawSort
          : undefined,
    }),
  );
}
