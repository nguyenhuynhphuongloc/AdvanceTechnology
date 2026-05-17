import Link from 'next/link';
import { PriceText } from './PriceText';
import type { ProductCard } from '@/lib/marketplace';

interface ProductCardProps {
  product: ProductCard;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl || `https://picsum.photos/seed/${product.id}/400/400`;

  return (
    <Link href={`/marketplace/products/${product.slug}`} className="group block">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {product.approvalStatus === 'approved' && (
            <div className="absolute top-2 left-2">
              <span className="bg-green-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>

          <div className="mb-2">
            <PriceText value={product.basePrice} />
          </div>

          {product.sellerName && (
            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {product.sellerName}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
