"use client";

import { useState, useEffect } from "react";
import { ProductDetailDto, ProductVariantDto } from "@/lib/products/types";
import { AddToCartPanel } from "./AddToCartPanel";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export function ProductDetailGrid({ product }: { product: ProductDetailDto }) {
  const [activeVariant, setActiveVariant] = useState<ProductVariantDto | null>(null);

  const mainImageUrl = activeVariant?.imageUrl || product.mainImage.imageUrl;
  const gallery = [product.mainImage, ...product.galleryImages];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left: Product Images */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900/50 border border-border-dim group relative flex items-center justify-center p-8">
          <img
            src={mainImageUrl}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((image) => (
            <div
              key={image.id}
              className={`rounded-xl overflow-hidden aspect-square flex items-center justify-center border transition-all duration-300 cursor-pointer hover:border-accent/50 ${
                image.imageUrl === mainImageUrl
                  ? "border-accent ring-1 ring-accent/30 bg-zinc-900/80"
                  : "border-border-dim bg-zinc-900/30"
              }`}
            >
              <img
                src={image.imageUrl}
                alt={image.altText || product.name}
                className="w-full h-full object-contain p-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Product Info */}
      <div className="lg:col-span-7 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-accent text-[11px] font-black uppercase tracking-[0.3em]">
              {product.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-foreground">
              {product.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-soft">Variants</span>
              <span className="text-sm font-bold text-text-muted">{product.variants.length}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-soft">Sizes</span>
              <span className="text-sm font-bold text-text-muted">{product.availableSizes.length}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-soft">Colors</span>
              <span className="text-sm font-bold text-text-muted">{product.availableColors.length}</span>
            </div>
          </div>

          {product.productionDate && (
            <div className="flex items-center mt-1">
              <span className="px-2.5 py-1 rounded bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                Release: {product.productionDate}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-4">
            <span className="text-5xl md:text-6xl font-black tracking-tightest text-foreground">
              {formatPrice(activeVariant ? activeVariant.price : product.basePrice)}
            </span>
            {product.variants.length > 1 && (
              <span className="text-text-soft text-sm font-bold uppercase tracking-widest italic">Starting from</span>
            )}
          </div>
          
          <p className="text-text-muted/90 text-lg leading-relaxed font-medium max-w-2xl border-l-2 border-accent/30 pl-6 py-2">
            {product.description}
          </p>
        </div>

        <div className="bg-surface-strong/30 rounded-3xl p-8 border border-border-dim backdrop-blur-sm">
          <AddToCartPanel product={product} onVariantChange={setActiveVariant} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border-dim pb-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-soft">
              Variant catalog
            </h2>
            <div className="px-2 py-0.5 rounded-full bg-surface-strong text-[9px] font-black text-text-muted uppercase tracking-widest border border-border-strong">
              {product.variants.length} SKU Available
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="group relative flex justify-between items-center gap-4 p-5 rounded-2xl bg-surface-muted/40 border border-border-dim transition-all duration-500 hover:border-accent/40 hover:bg-surface-strong/60 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-border-dim font-black text-sm text-accent group-hover:scale-110 transition-transform">
                    {variant.size}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-base text-foreground group-hover:text-accent transition-colors">
                      {variant.color}
                    </span>
                    <span className="text-[10px] font-bold text-text-soft uppercase tracking-widest">
                      ID: {variant.sku.split('-').pop()}
                    </span>
                  </div>
                </div>
                <span className="font-black text-xl text-foreground tabular-nums">
                  {formatPrice(variant.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
