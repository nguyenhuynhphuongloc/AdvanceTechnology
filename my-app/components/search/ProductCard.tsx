"use client";

import { Product } from "../../lib/search/types";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(product.price);

    // Provide a placeholder image if product.image is missing
    const imageUrl = product.image || `https://picsum.photos/seed/${product.id}/400/400`;

    return (
        <div
            className="product-card"
            style={{
                position: "relative",
                aspectRatio: "1/1",
                background: "#111",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 16,
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease"
            }}
        >
            <img
                src={imageUrl}
                alt={product.name}
                className="product-image"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease"
                }}
            />

            {/* Pill container overlay */}
            <div
                style={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    right: 16,
                    display: "flex",
                    justifyContent: "center",
                    pointerEvents: "none"
                }}
            >
                <div
                    style={{
                        background: "rgba(0, 0, 0, 0.6)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: 30,
                        padding: "8px 12px 8px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        maxWidth: "100%",
                        width: "max-content"
                    }}
                >
                    <span
                        style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}
                    >
                        {product.name}
                    </span>
                    <div
                        style={{
                            background: "#0052ff",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: 0.5
                        }}
                    >
                        {formattedPrice} USD
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .product-card:hover {
                    border-color: #0052ff !important;
                    box-shadow: 0 0 0 1px #0052ff;
                }
                .product-card:hover .product-image {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}
