import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCatalogHeader } from "../../../components/products/ProductCatalogHeader";
import { ProductGrid } from "../../../components/search/ProductGrid";
import { fetchProductBySlug, fetchRelatedProducts } from "../../../lib/products/api";
import { Product } from "../../../lib/search/types";

type PageParams = Promise<{ slug: string }>;

const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default async function ProductDetailPage({
    params,
}: {
    params: PageParams;
}) {
    const { slug } = await params;

    try {
        const product = await fetchProductBySlug(slug);
        const related = await fetchRelatedProducts(slug);
        const relatedProducts: Product[] = related.items.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            sku: item.sku,
            price: item.basePrice,
            imageUrl: item.imageUrl,
            category: item.category,
        }));

        const gallery = [product.mainImage, ...product.galleryImages];

        return (
            <div
                style={{
                    minHeight: "100vh",
                    background:
                        "linear-gradient(180deg, #180f13 0%, #0e1726 42%, #090b10 100%)",
                    color: "white",
                }}
            >
                <ProductCatalogHeader />
                <main style={{ maxWidth: 1220, margin: "0 auto", padding: "36px 24px 80px" }}>
                    <nav style={{ marginBottom: 24, display: "flex", gap: 8, color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                        <Link href="/products" style={{ color: "inherit", textDecoration: "none" }}>
                            Products
                        </Link>
                        <span>/</span>
                        <span>{product.name}</span>
                    </nav>

                    <section className="product-detail-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)", gap: 28 }}>
                        <div
                            style={{
                                padding: 24,
                                borderRadius: 28,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <div
                                style={{
                                    borderRadius: 22,
                                    overflow: "hidden",
                                    aspectRatio: "4 / 5",
                                    marginBottom: 16,
                                    background: "#111",
                                }}
                            >
                                <img
                                    src={product.mainImage.imageUrl}
                                    alt={product.mainImage.altText || product.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                                    gap: 12,
                                }}
                            >
                                {gallery.map((image) => (
                                    <div
                                        key={image.id}
                                        style={{
                                            borderRadius: 18,
                                            overflow: "hidden",
                                            border: image.isMain
                                                ? "1px solid rgba(242,95,76,0.8)"
                                                : "1px solid rgba(255,255,255,0.08)",
                                            background: "#111",
                                            aspectRatio: "1 / 1",
                                        }}
                                    >
                                        <img
                                            src={image.imageUrl}
                                            alt={image.altText || product.name}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: 28,
                                borderRadius: 28,
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                display: "grid",
                                gap: 24,
                                alignSelf: "start",
                            }}
                        >
                            <div style={{ display: "grid", gap: 8 }}>
                                <p style={{ margin: 0, color: "#f8cba6", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 12 }}>
                                    {product.category}
                                </p>
                                <h1 style={{ margin: 0, fontSize: "clamp(2.2rem, 4vw, 3.8rem)", lineHeight: 1 }}>
                                    {product.name}
                                </h1>
                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", color: "rgba(255,255,255,0.66)", fontSize: 14 }}>
                                    <span>SKU {product.sku}</span>
                                    <span>{product.variants.length} variants</span>
                                </div>
                            </div>

                            <div style={{ fontSize: 34, fontWeight: 700 }}>{formatPrice(product.basePrice)}</div>

                            <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
                                {product.description}
                            </p>

                            <div style={{ display: "grid", gap: 16 }}>
                                <div>
                                    <h2 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)" }}>
                                        Available sizes
                                    </h2>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        {product.availableSizes.map((size) => (
                                            <span
                                                key={size}
                                                style={{
                                                    padding: "10px 14px",
                                                    borderRadius: 999,
                                                    border: "1px solid rgba(255,255,255,0.14)",
                                                    background: "rgba(255,255,255,0.04)",
                                                }}
                                            >
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)" }}>
                                        Available colors
                                    </h2>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        {product.availableColors.map((color) => (
                                            <span
                                                key={color}
                                                style={{
                                                    padding: "10px 14px",
                                                    borderRadius: 999,
                                                    border: "1px solid rgba(255,255,255,0.14)",
                                                    background: "rgba(255,255,255,0.04)",
                                                }}
                                            >
                                                {color}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)" }}>
                                    Variant catalog
                                </h2>
                                <div style={{ display: "grid", gap: 10 }}>
                                    {product.variants.map((variant) => (
                                        <div
                                            key={variant.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 16,
                                                padding: "14px 16px",
                                                borderRadius: 18,
                                                background: "rgba(255,255,255,0.04)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{variant.color} / {variant.size}</div>
                                                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{variant.sku}</div>
                                            </div>
                                            <div style={{ fontWeight: 600 }}>{formatPrice(variant.price)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginTop: 48 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 18 }}>
                            <div>
                                <p style={{ margin: "0 0 8px", color: "#f8cba6", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 12 }}>
                                    Related
                                </p>
                                <h2 style={{ margin: 0, fontSize: 28 }}>More from the catalog</h2>
                            </div>
                        </div>
                        <ProductGrid products={relatedProducts} />
                    </section>

                    <style>{`
                        @media (max-width: 900px) {
                            .product-detail-grid {
                                grid-template-columns: 1fr !important;
                            }
                        }
                    `}</style>
                </main>
            </div>
        );
    } catch {
        notFound();
    }
}
