'use client';

import type { Product } from "@/lib/shopping/data";
import { useCart } from "@/lib/shopping/cart-context";
import { useAuth } from "@/lib/shopping/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!user) {
      router.push('/shopping/account');
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-4">
      <img
        src={product.image}
        alt={product.name}
        className="h-[320px] w-full rounded-xl object-cover"
      />

      <div className="mt-4 flex items-center justify-between gap-3 rounded-full border border-black/15 bg-white p-1.5 pl-4">
        <h2 className="truncate text-sm font-medium text-black">{product.name}</h2>
        <p className="rounded-full bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">
          ${product.price.toFixed(2)} USD
        </p>
      </div>

      <button
        onClick={handleAddToCart}
        className={`mt-3 w-full rounded-full py-2.5 text-sm font-semibold transition ${
          added
            ? 'bg-green-600 text-white'
            : 'bg-black text-white hover:bg-black/80'
        }`}
      >
        {added ? '✓ Đã thêm' : 'Thêm vào giỏ hàng'}
      </button>
    </article>
  );
}
