"use client";

import { useMemo, useState } from "react";
import { useCart, type CartProductSnapshot, type CartVariantSelection } from "@/lib/shopping/cart-context";
import type { ProductDetailDto, ProductVariantDto } from "@/lib/products/types";

type AddToCartPanelProps = {
  product: ProductDetailDto;
};

type DimensionOption = {
  value: string;
  availableWithCurrentPair: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function resolveVariant(
  variants: ProductVariantDto[],
  size?: string,
  color?: string,
) {
  return variants.find((variant) => variant.size === size && variant.color === color) ?? null;
}

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const { addToCart } = useCart();
  const defaultVariant = product.variants[0] ?? null;

  const [selectedSize, setSelectedSize] = useState(defaultVariant?.size ?? "");
  const [selectedColor, setSelectedColor] = useState(defaultVariant?.color ?? "");
  const [added, setAdded] = useState(false);

  const sizeOptions = useMemo<DimensionOption[]>(
    () =>
      uniqueValues(product.variants.map((variant) => variant.size)).map((size) => ({
        value: size,
        availableWithCurrentPair:
          selectedColor === ""
            ? true
            : product.variants.some((variant) => variant.size === size && variant.color === selectedColor),
      })),
    [product.variants, selectedColor],
  );

  const colorOptions = useMemo<DimensionOption[]>(
    () =>
      uniqueValues(product.variants.map((variant) => variant.color)).map((color) => ({
        value: color,
        availableWithCurrentPair:
          selectedSize === ""
            ? true
            : product.variants.some((variant) => variant.size === selectedSize && variant.color === color),
      })),
    [product.variants, selectedSize],
  );

  const activeVariant = useMemo(
    () => resolveVariant(product.variants, selectedSize, selectedColor) ?? defaultVariant,
    [defaultVariant, product.variants, selectedColor, selectedSize],
  );

  const snapshot: CartProductSnapshot | null = useMemo(
    () =>
      activeVariant
        ? {
            id: product.id,
            slug: product.slug,
            name: product.name,
            sku: activeVariant.sku,
            price: activeVariant.price,
            imageUrl: activeVariant.imageUrl || product.mainImage.imageUrl,
            category: product.category,
          }
        : null,
    [activeVariant, product],
  );

  const variantSelection: CartVariantSelection | undefined = activeVariant
    ? {
        id: activeVariant.id,
        sku: activeVariant.sku,
        color: activeVariant.color,
        size: activeVariant.size,
        price: activeVariant.price,
      }
    : undefined;

  function handleSizeSelection(nextSize: string) {
    const exactMatch = resolveVariant(product.variants, nextSize, selectedColor);
    if (exactMatch) {
      setSelectedSize(nextSize);
      return;
    }

    const fallback = product.variants.find((variant) => variant.size === nextSize) ?? null;
    if (fallback) {
      setSelectedSize(fallback.size);
      setSelectedColor(fallback.color);
    }
  }

  function handleColorSelection(nextColor: string) {
    const exactMatch = resolveVariant(product.variants, selectedSize, nextColor);
    if (exactMatch) {
      setSelectedColor(nextColor);
      return;
    }

    const fallback = product.variants.find((variant) => variant.color === nextColor) ?? null;
    if (fallback) {
      setSelectedSize(fallback.size);
      setSelectedColor(fallback.color);
    }
  }

  function handleAddToCart() {
    if (!snapshot || !variantSelection) {
      return;
    }

    addToCart(snapshot, variantSelection);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="storefront-panel storefront-purchase-panel">
      <div className="storefront-variant-summary">
        <div>
          <p className="storefront-kicker">Selected variant</p>
          <h2 className="storefront-variant-heading">
            {activeVariant ? `${activeVariant.color} / ${activeVariant.size}` : "Unavailable"}
          </h2>
        </div>
        <div className="storefront-variant-price-block">
          <span className="storefront-variant-price">
            {activeVariant ? formatCurrency(activeVariant.price) : formatCurrency(product.basePrice)}
          </span>
          <span className="storefront-variant-sku">
            {activeVariant ? `SKU ${activeVariant.sku}` : "Choose a variant"}
          </span>
        </div>
      </div>

      <div className="storefront-dimension-section">
        <div className="storefront-dimension-header">
          <span className="storefront-kicker">Size</span>
          <span className="storefront-dimension-value">{selectedSize || "Select size"}</span>
        </div>
        <div className="storefront-dimension-grid" role="group" aria-label="Choose size">
          {sizeOptions.map((option) => {
            const isActive = option.value === selectedSize;
            const isUnavailable = !option.availableWithCurrentPair && !isActive;

            return (
              <button
                key={option.value}
                type="button"
                className={[
                  "storefront-dimension-option",
                  isActive ? "storefront-dimension-option-active" : "",
                  isUnavailable ? "storefront-dimension-option-unavailable" : "",
                ].join(" ").trim()}
                aria-pressed={isActive}
                onClick={() => handleSizeSelection(option.value)}
              >
                {option.value}
              </button>
            );
          })}
        </div>
      </div>

      <div className="storefront-dimension-section">
        <div className="storefront-dimension-header">
          <span className="storefront-kicker">Color</span>
          <span className="storefront-dimension-value">{selectedColor || "Select color"}</span>
        </div>
        <div className="storefront-dimension-grid" role="group" aria-label="Choose color">
          {colorOptions.map((option) => {
            const isActive = option.value === selectedColor;
            const isUnavailable = !option.availableWithCurrentPair && !isActive;

            return (
              <button
                key={option.value}
                type="button"
                className={[
                  "storefront-dimension-option",
                  isActive ? "storefront-dimension-option-active" : "",
                  isUnavailable ? "storefront-dimension-option-unavailable" : "",
                ].join(" ").trim()}
                aria-pressed={isActive}
                onClick={() => handleColorSelection(option.value)}
              >
                {option.value}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="storefront-button storefront-button-primary storefront-add-to-cart-button"
        disabled={!activeVariant}
      >
        {added ? "Added to Cart" : "Add to Cart"}
      </button>

      <p className="storefront-purchase-note">
        Guests can keep items in their cart in this browser without logging in.
      </p>
    </div>
  );
}
