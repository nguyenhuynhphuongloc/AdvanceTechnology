import Image from 'next/image';
import Link from 'next/link';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import type { ProductCard, Shop } from '@/lib/marketplace';

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export function buttonClassName({
  variant = 'default',
  size = 'default',
  className = '',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-[#030213] !text-white [color:white] hover:bg-[#030213]/90 hover:!text-white hover:[color:white] focus:!text-white focus:[color:white] focus-visible:!text-white focus-visible:[color:white] active:!text-white active:[color:white] visited:!text-white visited:[color:white] [&_*]:!text-white [&_*]:[color:white]',
    outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
    ghost: 'text-gray-900 hover:bg-gray-100',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes: Record<ButtonSize, string> = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3',
    lg: 'h-10 px-6',
    icon: 'h-9 w-9',
  };

  return cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={buttonClassName({ variant, size, className })} {...props} />;
}

export function Card({ className = '', children }: { className?: string; children?: ReactNode }) {
  return <div className={cn('flex flex-col gap-6 rounded-xl border border-gray-200 bg-white text-gray-950', className)}>{children}</div>;
}

export function CardHeader({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={cn('grid auto-rows-min items-start gap-1.5 px-6 pt-6', className)}>{children}</div>;
}

export function CardTitle({ className = '', children }: { className?: string; children: ReactNode }) {
  return <h4 className={cn('leading-none font-semibold', className)}>{children}</h4>;
}

export function CardContent({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>;
}

export function Badge({
  className = '',
  variant = 'default',
  children,
}: {
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children: ReactNode;
}) {
  const variants = {
    default: 'border-transparent bg-[#030213] text-white',
    secondary: 'border-transparent bg-gray-100 text-gray-900',
    destructive: 'border-transparent bg-red-600 text-white',
    outline: 'border-gray-200 text-gray-900',
  };
  return (
    <span className={cn('inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('h-9 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-1 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50', className)}
      {...props}
    />
  );
}

export function Label({ className = '', children, htmlFor }: { className?: string; children: ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className={cn('text-sm font-medium leading-none', className)}>{children}</label>;
}

export function Separator({ className = '' }: { className?: string }) {
  return <div className={cn('h-px w-full bg-gray-200', className)} />;
}

export function formatVnd(value: number) {
  return `₫${Number(value || 0).toLocaleString('vi-VN')}`;
}

export function imageFallback(seed: string, width = 600, height = 600) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export function SearchIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="M21 21l-4.3-4.3m1.8-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />;
}

export function StoreIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <Icon className={className} path="M4 10h16l-1-5H5l-1 5Zm1 0v9h14v-9M9 19v-5h6v5" />;
}

export function HomeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" />;
}

export function PackageIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <Icon className={className} path="m21 8-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8M12 13v8" />;
}

export function CartIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <Icon className={className} path="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2 2h12M9 19a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />;
}

export function UserIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <Icon className={className} path="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21a8 8 0 0 1 16 0" />;
}

export function ArrowRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="M5 12h14m-6-6 6 6-6 6" />;
}

export function ArrowLeftIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="M19 12H5m6-6-6 6 6 6" />;
}

export function StarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2.8 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.7l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 2.8Z" />
    </svg>
  );
}

export function TrendIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return <Icon className={className} path="m4 16 5-5 4 4 7-8m0 0h-5m5 0v5" />;
}

export function SlidersIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="M4 7h10m4 0h2M4 17h2m4 0h10M14 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM6 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />;
}

export function MinusIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="M5 12h14" />;
}

export function PlusIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="M12 5v14M5 12h14" />;
}

export function TrashIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />;
}

export function MapPinIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <Icon className={className} path="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />;
}

export function CreditCardIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <Icon className={className} path="M3 8h18M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2 10h1m4 0h3" />;
}

export function WalletIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <Icon className={className} path="M4 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3h12M16 13h3" />;
}

export function CheckCircleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <Icon className={className} path="M9 12.5 11 14l4-5m6 3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />;
}

export function MailIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <Icon className={className} path="M4 6h16v12H4V6Zm0 1 8 6 8-6" />;
}

export function PhoneIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <Icon className={className} path="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />;
}

export function ChevronRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="m9 18 6-6-6-6" />;
}

export function ShieldIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />;
}

export function HelpIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Icon className={className} path="M9.1 9a3 3 0 1 1 5.8 1c-.7 1.2-2.1 1.4-2.6 2.5M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />;
}

function Icon({ className, path }: { className: string; path: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export function ProductCardLikeSample({ product }: { product: ProductCard }) {
  const imageUrl = product.imageUrl || imageFallback(product.id);
  return (
    <Link key={product.id} href={`/marketplace/products/${product.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            unoptimized
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="mb-1 line-clamp-2 font-semibold transition-colors group-hover:text-blue-600">
            {product.name}
          </h3>
          <p className="mb-2 text-sm text-gray-600">{product.sellerName || 'Marketplace Seller'}</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-blue-600">{formatVnd(product.basePrice)}</p>
            <div className="flex items-center gap-1 text-sm">
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>New</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ShopCardLikeSample({ shop }: { shop: Shop }) {
  const logoUrl = shop.logoUrl || imageFallback(`${shop.id}-logo`, 200, 200);
  const bannerUrl = shop.bannerUrl || imageFallback(`${shop.id}-banner`, 1200, 420);
  return (
    <Link key={shop.id} href={`/marketplace/shops/${shop.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative h-32 overflow-hidden bg-gray-100">
          <Image
            src={bannerUrl}
            alt={shop.name}
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {shop.status === 'approved' && (
            <Badge className="absolute right-2 top-2" variant="secondary">Verified</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-3 flex items-start gap-3">
            <Image
              src={logoUrl}
              alt={shop.name}
              width={64}
              height={64}
              unoptimized
              className="-mt-8 h-16 w-16 rounded-full border-4 border-white object-cover shadow-md"
            />
            <div className="mt-2 min-w-0 flex-1">
              <h3 className="mb-1 truncate font-semibold transition-colors group-hover:text-blue-600">
                {shop.name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{shop.rating?.toFixed(1) || 'New'}</span>
                </div>
                <span>{shop.totalProducts ?? 0} products</span>
              </div>
            </div>
          </div>
          {shop.description && <p className="line-clamp-2 text-sm text-gray-600">{shop.description}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}
