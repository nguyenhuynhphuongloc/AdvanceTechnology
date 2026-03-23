'use client';

import { useCart } from '@/lib/shopping/cart-context';
import Link from 'next/link';

export default function CartButton() {
  const { totalCount } = useCart();

  return (
    <Link
      href="/product/cart"
      className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white transition hover:border-white/35 lg:inline-flex"
      aria-label="Giỏ hàng"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>

      {totalCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
          {totalCount > 99 ? '99+' : totalCount}
        </span>
      )}
    </Link>
  );
}
