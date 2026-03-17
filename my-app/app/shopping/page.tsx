import ShoppingHeader from "@/components/shopping/ShoppingHeader";
import ProductList from "@/components/shopping/ProductList";
import {
  categories,
  products,
  sortOptions,
  type Product,
  type SortKey,
} from "@/lib/shopping/data";

type SearchParams = {
  q?: string;
  sort?: string;
  category?: string;
};

function getSortKey(value: string | undefined): SortKey {
  const matched = sortOptions.find((option) => option.key === value);
  return matched ? matched.key : "relevance";
}

function filterAndSortProducts(
  items: Product[],
  query: string,
  selectedCategory: string,
  selectedSort: SortKey,
) {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    const byCategory = selectedCategory === "All" || item.category === selectedCategory;
    const byQuery =
      normalizedQuery.length === 0 ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery);

    return byCategory && byQuery;
  });

  const relevanceScore = (item: Product) => {
    if (!normalizedQuery) return 0;
    const name = item.name.toLowerCase();
    const category = item.category.toLowerCase();
    const exactName = name === normalizedQuery ? 100 : 0;
    const startsWith = name.startsWith(normalizedQuery) ? 50 : 0;
    const nameContains = name.includes(normalizedQuery) ? 25 : 0;
    const categoryContains = category.includes(normalizedQuery) ? 10 : 0;

    return exactName + startsWith + nameContains + categoryContains + item.trendingScore / 10;
  };

  return [...filtered].sort((first, second) => {
    switch (selectedSort) {
      case "price-asc":
        return first.price - second.price;
      case "price-desc":
        return second.price - first.price;
      case "latest-desc":
        return Date.parse(second.createdAt) - Date.parse(first.createdAt);
      case "trending":
        return second.trendingScore - first.trendingScore;
      default:
        return relevanceScore(second) - relevanceScore(first);
    }
  });
}

function buildHref(query: string, sort: SortKey, category?: string) {
  const params = new URLSearchParams();

  if (query) params.set("q", query);
  if (sort) params.set("sort", sort);
  if (category && category !== "All") params.set("category", category);

  const queryString = params.toString();
  return queryString ? `/shopping?${queryString}` : "/shopping";
}

export default async function ShoppingPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const searchQuery = params.q?.trim() ?? "";
  const selectedSort = getSortKey(params.sort);
  const selectedCategory =
    categories.find((category) => category === params.category) ?? "All";

  const filteredProducts = filterAndSortProducts(
    products,
    searchQuery,
    selectedCategory,
    selectedSort,
  );

  const titleQuery = searchQuery.length > 0 ? `"${searchQuery}"` : "all products";

  return (
    <main className="min-h-screen bg-[#f7f7f7] p-6 lg:p-8">
      <div className="mx-auto max-w-[1700px]">
        <ShoppingHeader
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          selectedSort={selectedSort}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[190px_minmax(0,1fr)_220px]">
          <aside>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-black/40">Collections</p>
            <nav className="space-y-0.5 text-sm text-black/90">
              {categories.map((category) => {
                const isActive = category === selectedCategory;

                return (
                  <a
                    key={category}
                    href={buildHref(searchQuery, selectedSort, category)}
                    className={[
                      "block w-fit border-b border-transparent py-0.5 leading-5",
                      isActive ? "font-semibold border-black" : "hover:border-black/30",
                    ].join(" ")}
                  >
                    {category}
                  </a>
                );
              })}
            </nav>
          </aside>

          <section>
            {searchQuery.length > 0 && (
              <h1 className="mb-5 text-5xl font-medium tracking-tight text-black">
                Showing {filteredProducts.length} results for "{searchQuery}"
              </h1>
            )}
            <ProductList products={filteredProducts} />
          </section>

          <aside>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-black/40">Sort by</p>
            <nav className="space-y-0.5 text-sm text-black/90">
              {sortOptions.map((option) => {
                const isActive = option.key === selectedSort;

                return (
                  <a
                    key={option.key}
                    href={buildHref(searchQuery, option.key, selectedCategory)}
                    className={[
                      "block w-fit border-b border-transparent py-0.5 leading-5",
                      isActive ? "font-semibold border-black" : "hover:border-black/30",
                    ].join(" ")}
                  >
                    {option.label}
                  </a>
                );
              })}
            </nav>
          </aside>
        </div>
      </div>
    </main>
  );
}
