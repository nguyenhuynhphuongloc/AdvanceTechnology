'use client';

import Link from 'next/link';
import type { Category } from '@/lib/marketplace';

interface CategoryPillProps {
  category: Category;
  selected?: boolean;
}

export function CategoryPill({ category, selected }: CategoryPillProps) {
  return (
    <Link
      href={`/marketplace/products?category=${category.slug}`}
      className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
        selected
          ? 'bg-orange-500 text-white border-orange-500'
          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500'
      }`}
    >
      {category.name}
    </Link>
  );
}

interface CategoryFilterProps {
  categories: Category[];
  selectedSlug?: string;
  className?: string;
}

export function CategoryFilter({ categories, selectedSlug, className = '' }: CategoryFilterProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide ${className}`}>
      <Link
        href="/marketplace/products"
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
          !selectedSlug
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500'
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <CategoryPill key={cat.id} category={cat} selected={cat.slug === selectedSlug} />
      ))}
    </div>
  );
}
