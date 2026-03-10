"use client";

import { Empty, Button } from "antd";
import { Product } from "../../lib/search/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
    products: Product[];
    onClearFilters: () => void;
}

export function ProductGrid({ products, onClearFilters }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div style={{
                padding: "80px 0",
                background: "transparent",
                borderRadius: 8,
                marginTop: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div style={{ fontSize: 24, color: "white", marginBottom: 16 }}>
                    No products found
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>
                    Try adjusting your search or filters.
                </div>
                <Button
                    type="primary"
                    onClick={onClearFilters}
                    style={{ background: "#0052ff", borderColor: "#0052ff", borderRadius: 30, padding: "0 24px", height: 40 }}
                >
                    Clear filters
                </Button>
            </div>
        );
    }

    return (
        <div
            className="product-grid"
            style={{
                display: "grid",
                gap: 16,
                width: "100%"
            }}
        >
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}

            <style jsx global>{`
                .product-grid {
                    grid-template-columns: repeat(1, 1fr);
                }
                @media (min-width: 640px) {
                    .product-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (min-width: 1024px) {
                    .product-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
            `}</style>
        </div>
    );
}
