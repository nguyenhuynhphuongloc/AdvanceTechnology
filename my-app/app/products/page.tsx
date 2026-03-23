import { CatalogPagination } from "../../components/products/CatalogPagination";
import { ProductCatalogHeader } from "../../components/products/ProductCatalogHeader";
import { ProductCollectionNav } from "../../components/products/ProductCollectionNav";
import { ProductSortSelect } from "../../components/products/ProductSortSelect";
import { ProductGrid } from "../../components/search/ProductGrid";
import { StorefrontFooter } from "../../components/storefront/StorefrontFooter";
import { StorefrontStatusCard } from "../../components/storefront/StorefrontStatusCard";
import { fetchProducts } from "../../lib/products/api";
import { normalizeSearchQuery, toStorefrontProduct } from "../../lib/products/storefront";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = normalizeSearchQuery(await searchParams);

  try {
    const productResponse = await fetchProducts({
      page: params.page,
      limit: 12,
      search: params.search,
      category: params.category,
      sort: params.sort,
    });

    const products = productResponse.items.map(toStorefrontProduct);
    const summary = `${productResponse.total} item${productResponse.total === 1 ? "" : "s"}`;

    return (
      <div className="storefront-page">
        <ProductCatalogHeader search={params.search} actionPath="/products" />
        <main className="storefront-container" style={{ padding: "40px 0 0" }}>
          <section style={{ display: "grid", gap: 24, marginBottom: 30 }}>
            <p className="storefront-kicker">Gateway-backed catalog</p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 18,
                alignItems: "end",
                flexWrap: "wrap",
              }}
            >
              <div style={{ maxWidth: 720 }}>
                <h1 style={{ margin: "0 0 12px", fontSize: "clamp(2.4rem, 5vw, 4.8rem)", lineHeight: 1 }}>
                  Products built from the live catalog API
                </h1>
                <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 560, fontSize: 16, lineHeight: 1.7 }}>
                  Browse the product-service catalog through the API gateway with real category filters,
                  search, sorting, pagination, and slug-based links into the detail page.
                </p>
              </div>
              <ProductSortSelect currentSort={params.sort} currentSearch={params.search} currentCategory={params.category} />
            </div>
          </section>

          <section className="storefront-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <ProductCollectionNav activeCategory={params.category} currentSearch={params.search} currentSort={params.sort} />
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{summary}</div>
            </div>

            <ProductGrid products={products} clearHref="/products" />

            <CatalogPagination
              basePath="/products"
              page={productResponse.page}
              limit={productResponse.limit}
              total={productResponse.total}
              query={{
                search: params.search,
                category: params.category,
                sort: params.sort !== "latest" ? params.sort : undefined,
              }}
            />
          </section>
        </main>
        <StorefrontFooter />
      </div>
    );
  } catch {
    return (
      <div className="storefront-page">
        <ProductCatalogHeader search={params.search} actionPath="/products" />
        <main className="storefront-container" style={{ paddingTop: 40 }}>
          <StorefrontStatusCard
            title="Catalog unavailable"
            description="The product listing could not load from the API gateway. Check product-service and gateway health, then try again."
            actionHref="/"
            actionLabel="Back home"
            tone="error"
          />
        </main>
        <StorefrontFooter />
      </div>
    );
  }
}
