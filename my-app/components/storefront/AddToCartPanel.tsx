"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart, type CartProductSnapshot, type CartVariantSelection } from "@/lib/shopping/cart-context";
import type { ProductDetailDto, ProductVariantDto } from "@/lib/products/types";

type AddToCartPanelProps = {
  product: ProductDetailDto;
  onVariantChange?: (variant: ProductVariantDto | null) => void;
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

export function AddToCartPanel({ product, onVariantChange }: AddToCartPanelProps) {
  const { addToCart } = useCart();
  const defaultVariant = product.variants[0] ?? null;

  const [selectedSize, setSelectedSize] = useState(defaultVariant?.size ?? "");
  const [selectedColor, setSelectedColor] = useState(defaultVariant?.color ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  useEffect(() => {
    onVariantChange?.(activeVariant);
  }, [activeVariant, onVariantChange]);

  const snapshot: CartProductSnapshot = useMemo(() => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: activeVariant?.sku || product.id,
    price: activeVariant?.price || product.basePrice,
    imageUrl: activeVariant?.imageUrl || product.mainImage.imageUrl,
    category: product.category,
  }), [activeVariant, product]);

  const variantSelection: CartVariantSelection | undefined = useMemo(() => activeVariant ? {
    id: activeVariant.id,
    sku: activeVariant.sku,
    color: activeVariant.color,
    size: activeVariant.size,
    price: activeVariant.price,
  } : undefined, [activeVariant]);

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
    try {
      Array.from({ length: quantity }).forEach(() => addToCart(snapshot, variantSelection));
      setAdded(true);
      setShowModal(true);
      window.setTimeout(() => setAdded(false), 2000);
    } catch {
      setAdded(false);
    }
  }

  function handleBuyNow() {
    Array.from({ length: quantity }).forEach(() => addToCart(snapshot, variantSelection));
    window.location.href = "/product/cart";
  }

  const isAddable = product.variants.length === 0 || activeVariant !== null;

  return (
    <div className="flex flex-col gap-8">
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-success shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              
              <h3 className="mb-2 text-2xl font-black tracking-tight text-white uppercase italic">Added to Bag</h3>
              <p className="mb-8 text-sm font-medium text-text-soft">
                {product.name} has been added successfully.
              </p>
              
              <div className="flex w-full flex-col gap-3">
                <Link 
                  href="/product/cart"
                  className="flex h-14 w-full items-center justify-center rounded-2xl bg-accent font-black text-accent-contrast uppercase tracking-[0.1em] text-xs transition-transform active:scale-95 shadow-[0_5px_15px_rgba(242,95,76,0.3)]"
                >
                  View My Cart
                </Link>
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex h-14 w-full items-center justify-center rounded-2xl border border-white/10 font-bold text-foreground text-xs uppercase tracking-[0.1em] transition-colors hover:bg-white/5"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-soft">Configuration</span>
          <h2 className="text-xl font-bold text-foreground">
            {activeVariant ? `${activeVariant.color} / ${activeVariant.size}` : product.variants.length === 0 ? "Default Version" : "Select Variant"}
          </h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-2xl font-black text-accent">
            {activeVariant ? formatCurrency(activeVariant.price) : formatCurrency(product.basePrice)}
          </span>
          <span className="text-[10px] font-bold text-text-soft uppercase tracking-widest">
            {activeVariant ? `SKU: ${activeVariant.sku}` : product.variants.length === 0 ? `SKU: ${product.id.slice(0, 8).toUpperCase()}` : "Multiple variants"}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-success">
            {(product.stock ?? 0) > 0 ? `${product.stock} in stock` : "Stock pending"}
          </span>
        </div>
      </div>

      {product.variants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Size Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-soft">Size</span>
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{selectedSize || "Required"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((option) => {
                const isActive = option.value === selectedSize;
                const isUnavailable = !option.availableWithCurrentPair && !isActive;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`
                      min-w-[48px] h-12 flex items-center justify-center rounded-xl border font-bold text-sm transition-all duration-300
                      ${isActive 
                        ? "bg-accent border-accent text-accent-contrast shadow-[0_0_15px_rgba(242,95,76,0.25)] scale-105" 
                        : isUnavailable
                          ? "bg-white/[0.02] border-white/5 text-text-soft/30 cursor-not-allowed"
                          : "bg-white/5 border-white/10 text-foreground hover:border-white/30 hover:bg-white/10"
                      }
                    `}
                    aria-pressed={isActive}
                    onClick={() => handleSizeSelection(option.value)}
                    disabled={isUnavailable}
                  >
                    {option.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-soft">Color</span>
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{selectedColor || "Required"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => {
                const isActive = option.value === selectedColor;
                const isUnavailable = !option.availableWithCurrentPair && !isActive;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`
                      px-4 h-12 flex items-center justify-center rounded-xl border font-bold text-sm transition-all duration-300
                      ${isActive 
                        ? "bg-accent border-accent text-accent-contrast shadow-[0_0_15px_rgba(242,95,76,0.25)] scale-105" 
                        : isUnavailable
                          ? "bg-white/[0.02] border-white/5 text-text-soft/30 cursor-not-allowed"
                          : "bg-white/5 border-white/10 text-foreground hover:border-white/30 hover:bg-white/10"
                      }
                    `}
                    aria-pressed={isActive}
                    onClick={() => handleColorSelection(option.value)}
                    disabled={isUnavailable}
                  >
                    {option.value}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-soft">
            Quantity
          </span>
          <p className="mt-1 text-sm font-medium text-text-muted">
            Choose how many units to add.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 p-1">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white transition hover:bg-white/10"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-black text-white">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.min(99, current + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white transition hover:bg-white/10"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`
            flex-1 h-14 flex items-center justify-center gap-3 rounded-2xl border font-black text-xs uppercase tracking-[0.2em] transition-all duration-500
            ${added 
              ? "bg-success/20 border-success/40 text-success" 
              : !isAddable 
                ? "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
                : "bg-white/5 border-white/10 text-foreground hover:bg-white/10 hover:border-white/20 hover:-translate-y-1"
            }
          `}
          disabled={!isAddable}
        >
          {added ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Success
            </>
          ) : !isAddable ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              Add to cart
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              Add to cart
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="flex-1 h-14 flex items-center justify-center gap-3 rounded-2xl bg-accent border border-accent text-accent-contrast font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:bg-accent-strong hover:shadow-[0_0_30px_rgba(242,95,76,0.4)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isAddable}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          Buy Now
        </button>
      </div>

      <p className="text-center text-[10px] font-medium text-text-soft uppercase tracking-widest">
        Free express delivery for orders over $150
      </p>
    </div>
  );
}
