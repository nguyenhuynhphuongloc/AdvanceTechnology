import { CatalogPagination } from "../../components/products/CatalogPagination";
import { ProductCatalogHeader } from "../../components/products/ProductCatalogHeader";
import { ProductGrid } from "../../components/search/ProductGrid";
import { CollectionsSidebar } from "../../components/search/CollectionsSidebar";
import { SortSidebar } from "../../components/search/SortSidebar";
import { StorefrontFooter } from "../../components/storefront/StorefrontFooter";
import { StorefrontStatusCard } from "../../components/storefront/StorefrontStatusCard";
import { fetchCatalogPage } from "../../lib/products/catalog";
import { PRODUCT_LIST_PATH } from "../../lib/products/routes";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const rawParams = await searchParams;
  const catalogPage = await fetchCatalogPage(rawParams).catch(() => null);

  if (catalogPage) {
    const { params, products, response } = catalogPage;
    const resultText = params.search
      ? `${response.total} results for "${params.search}"`
      : `${response.total} catalog results`;

    return (
      <div className="storefront-page">
        <ProductCatalogHeader search={params.search} actionPath="/search" />

        <main
          className="storefront-container"
          style={{
            padding: "32px 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <section style={{ display: "grid", gap: 14 }}>
            <p className="storefront-kicker">Live search</p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: "clamp(2.2rem, 5vw, 4.2rem)", lineHeight: 1 }}>
                  Search the catalog through real gateway-backed data
                </h1>
                <p style={{ margin: "12px 0 0", color: "var(--text-muted)", maxWidth: 620, lineHeight: 1.7 }}>
                  Search results now come from the existing product-service APIs instead of mock storefront fixtures.
                </p>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 15 }}>{resultText}</div>
            </div>
          </section>

          <div className="search-layout">
            <CollectionsSidebar />

            <section className="storefront-card" style={{ padding: 24, minWidth: 0 }}>
              <ProductGrid
                products={products}
                emptyTitle="No matching products"
                emptyDescription="Try a different keyword or category filter to discover items from the live catalog."
                clearHref="/search"
              />

              <CatalogPagination
                basePath="/search"
                page={response.page}
                limit={response.limit}
                total={response.total}
                query={{
                  search: params.search,
                  category: params.category,
                  sort: params.sort !== "latest" ? params.sort : undefined,
                }}
              />
            </section>

            <SortSidebar />
          </div>
        </main>

        <StorefrontFooter />
      </div>
    );
  }

  const { search } = rawParams;
  const currentSearch = Array.isArray(search) ? search[0] : search;
  return (
    <div className="storefront-page">
      <ProductCatalogHeader search={currentSearch} actionPath="/search" />
      <main className="storefront-container" style={{ paddingTop: 40 }}>
        <StorefrontStatusCard
          title="Search is temporarily unavailable"
          description="The storefront could not load search results from the API gateway. Verify the catalog services are running, then try again."
          actionHref={PRODUCT_LIST_PATH}
          actionLabel="Browse products"
          tone="error"
        />
      </main>
      <StorefrontFooter />
    </div>
  );
}
