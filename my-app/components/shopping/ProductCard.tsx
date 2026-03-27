'use client';

import type { Product } from "@/lib/shopping/data";
import { useCart } from "@/lib/shopping/cart-context";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      imageUrl: product.image,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-[#111] p-4">
      <img
        src={product.image}
        alt={product.name}
        className="h-[320px] w-full rounded-xl object-cover"
      />

      <div className="mt-4 flex items-center justify-between gap-3 rounded-full border border-white/10 bg-black/50 p-1.5 pl-4">
        <h2 className="truncate text-sm font-medium text-white">{product.name}</h2>
        <p className="rounded-full bg-[#0052ff] px-3 py-1.5 text-sm font-semibold text-white">
          ${product.price.toFixed(2)} USD
        </p>
      </div>

      <button
        onClick={handleAddToCart}
        className={`mt-3 w-full rounded-full py-2.5 text-sm font-semibold transition ${
          added
            ? 'bg-green-600 text-white'
            : 'bg-[#0052ff] text-white hover:bg-[#0b46cc]'
        }`}
      >
        {added ? 'Added to Cart' : 'Add to Cart'}
      </button>
    </article>
  );
}
