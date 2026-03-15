import { ProductCatalogHeader } from "../../components/products/ProductCatalogHeader";
import { ProductCollectionNav } from "../../components/products/ProductCollectionNav";
import { ProductSortSelect } from "../../components/products/ProductSortSelect";
import { ProductGrid } from "../../components/search/ProductGrid";
import { fetchProducts } from "../../lib/products/api";
import { ProductSort } from "../../lib/products/types";
import { Product } from "../../lib/search/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const validSorts: ProductSort[] = ["latest", "price-asc", "price-desc", "name-asc", "name-desc"];

function toCardProduct(product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    category: string;
    basePrice: number;
    imageUrl: string;
}): Product {
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

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const page = Number(params.page ?? "1");
    const search = typeof params.search === "string" ? params.search : undefined;
    const category = typeof params.category === "string" ? params.category : undefined;
    const sort =
        typeof params.sort === "string" && validSorts.includes(params.sort as ProductSort)
            ? (params.sort as ProductSort)
            : "latest";

    const productResponse = await fetchProducts({
        page: Number.isFinite(page) && page > 0 ? page : 1,
        limit: 12,
        search,
        category,
        sort,
    });

    const products = productResponse.items.map(toCardProduct);
    const summary = `${productResponse.total} item${productResponse.total === 1 ? "" : "s"}`;

    return (
        <div
            style={{
                minHeight: "100vh",
                background:
                    "radial-gradient(circle at top, rgba(242,95,76,0.22), transparent 35%), linear-gradient(180deg, #09131d 0%, #0d1117 52%, #15111d 100%)",
                color: "white",
            }}
        >
            <ProductCatalogHeader search={search} />
            <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
                <section style={{ display: "grid", gap: 24, marginBottom: 30 }}>
                    <p style={{ margin: 0, color: "#f8cba6", letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 12 }}>
                        Gateway-backed catalog
                    </p>
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
                            <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", maxWidth: 560, fontSize: 16 }}>
                                Browse the product-service catalog through the API gateway with real category filters,
                                search, sorting, and slug-based links into the detail page.
                            </p>
                        </div>
                        <ProductSortSelect currentSort={sort} currentSearch={search} currentCategory={category} />
                    </div>
                </section>

                <section
                    style={{
                        padding: 24,
                        borderRadius: 28,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 30px 80px rgba(0,0,0,0.22)",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
                        <ProductCollectionNav activeCategory={category} currentSearch={search} currentSort={sort} />
                        <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 14 }}>{summary}</div>
                    </div>

                    <ProductGrid products={products} />
                </section>
            </main>
        </div>
    );
}
