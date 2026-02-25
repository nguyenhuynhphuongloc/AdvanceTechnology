"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchHeader } from "../../components/search/SearchHeader";
import { CollectionsSidebar } from "../../components/search/CollectionsSidebar";
import { SortSidebar } from "../../components/search/SortSidebar";
import { ProductGrid } from "../../components/search/ProductGrid";
import { mockProducts } from "../../lib/search/mockProducts";
import { getValidSortOption, filterAndSortProducts } from "../../lib/search/utils";

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const query = searchParams.get("q") || "";
    const rawSort = searchParams.get("sort");
    const sort = getValidSortOption(rawSort);
    const collection = searchParams.get("collection");

    useEffect(() => {
        // Enforce whitelist for sort parameter. If an invalid sort exists in the URL,
        // we fallback to default and update the URL accordingly.
        if (rawSort && rawSort !== sort) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("sort", sort);
            router.replace(`/search?${params.toString()}`);
        }
    }, [rawSort, sort, router, searchParams]);

    const handleClearFilters = () => {
        router.replace("/search");
    };

    const filteredAndSortedProducts = filterAndSortProducts(mockProducts, query, sort, collection);

    const resultText = query
        ? `${filteredAndSortedProducts.length} results for "${query}"`
        : `${filteredAndSortedProducts.length} results`;

    return (
        <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "white" }}>
            <SearchHeader initialQuery={query} />

            <main style={{
                maxWidth: 1600,
                margin: "0 auto",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 32
            }}>
                <div className="layout-desktop">
                    <CollectionsSidebar />

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'white', marginBottom: '8px' }}>DEBUG: {filteredAndSortedProducts.length} products</div>
                        {query && (
                            <div style={{ marginBottom: 24, fontSize: 16, color: "rgba(255,255,255,0.8)" }}>
                                {resultText}
                            </div>
                        )}
                        <ProductGrid
                            products={filteredAndSortedProducts}
                            onClearFilters={handleClearFilters}
                        />
                    </div>

                    <SortSidebar />
                </div>

                {/* Mobile Layout Fallback */}
                <div className="layout-mobile">
                    <div style={{
                        display: "flex",
                        gap: 16,
                        overflowX: "auto",
                        paddingBottom: 8,
                        scrollbarWidth: "none"
                    }}>
                        <div style={{ minWidth: "max-content" }}>
                            <CollectionsSidebar />
                        </div>
                        <div style={{ minWidth: "max-content" }}>
                            <SortSidebar />
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ color: 'white', marginBottom: '8px' }}>DEBUG: {filteredAndSortedProducts.length} products</div>
                        {query && (
                            <div style={{ marginBottom: 24, fontSize: 16, color: "rgba(255,255,255,0.8)" }}>
                                {resultText}
                            </div>
                        )}
                        <ProductGrid
                            products={filteredAndSortedProducts}
                            onClearFilters={handleClearFilters}
                        />
                    </div>
                </div>
            </main>

            <style jsx global>{`
                body {
                    margin: 0;
                    background: #0b0b0b;
                    color: white;
                }
                .layout-desktop {
                    display: none;
                    gap: 32px;
                    align-items: flex-start;
                }
                .layout-mobile {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }
                @media (min-width: 768px) {
                    .layout-desktop {
                        display: flex;
                    }
                    .layout-mobile {
                        display: none !important;
                    }
                }
                /* Optional: Hide webkit scrollbar for nicer mobile scroll */
                ::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div style={{ padding: 40, background: "#0b0b0b", color: "white", minHeight: "100vh" }}>Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}