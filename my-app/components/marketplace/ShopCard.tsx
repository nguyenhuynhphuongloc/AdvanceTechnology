import Link from 'next/link';
import type { Shop } from '@/lib/marketplace';

interface ShopCardProps {
  shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
  const logoUrl = shop.logoUrl || `https://picsum.photos/seed/${shop.id}-logo/200/200`;

  const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-gray-100 text-gray-600',
  };

  return (
    <Link href={`/marketplace/shops/${shop.slug}`} className="group block">
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={logoUrl}
            alt={shop.name}
            className="w-14 h-14 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
              {shop.name}
            </h3>
            <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 ${statusColors[shop.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {shop.status.charAt(0).toUpperCase() + shop.status.slice(1)}
            </span>
            {shop.totalProducts !== undefined && (
              <p className="text-xs text-gray-400 mt-1">{shop.totalProducts} products</p>
            )}
          </div>
        </div>

        {shop.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{shop.description}</p>
        )}
      </div>
    </Link>
  );
}
