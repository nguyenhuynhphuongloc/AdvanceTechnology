"use client";

import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import type { ProductSort } from "@/lib/products/types";

type ShoppingHeaderProps = {
  searchQuery: string;
  selectedCategory: string;
  selectedSort: ProductSort;
};

export default function ShoppingHeader({
  searchQuery,
  selectedCategory,
  selectedSort,
}: ShoppingHeaderProps) {
  return (
    <StorefrontHeader
      activeNav="products"
      searchQuery={searchQuery}
      selectedCategory={selectedCategory}
      selectedSort={selectedSort}
      searchAction="/product"
    />
  );
}
