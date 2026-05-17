# Phase 6 UI Components Reference

Generated: 2026-05-17T14:58:00Z

## Component Library

All components: `my-app/components/marketplace/`

---

## Layout Components

### `MarketplaceShell` (via `layout.tsx`)

Wraps all marketplace pages. Provides white theme context.

```tsx
// Used implicitly via my-app/app/marketplace/layout.tsx
// Theme: bg gray-50, text gray-900, accent orange-500
```

### `MarketplaceHeader`

Sticky white header with logo, search bar, and navigation icons.

Props: none (reads cookie for auth state, fetches cart count)

Features:
- Search bar with form submission
- Nav icons: Home, Products, Shops, Cart (with count badge), Orders, Profile
- Cart badge shows item count
- Only shows auth-required items when logged in
- Mobile hamburger menu

### `MarketplaceFooter`

Simple footer with 4-column links grid.

---

## Display Components

### `ProductCard`

Product card for grid display.

Props:
```ts
interface ProductCardProps {
  product: ProductCard;
}
```

Renders: image (with fallback to picsum), name, price (VND), seller name, verified badge.

### `ProductGrid`

Responsive product grid.

Props:
```ts
interface ProductGridProps {
  products: ProductCard[];
  loading?: boolean;
}
```

Renders: loading skeleton (12 cards) when loading, empty when no products, product cards otherwise.

Grid: `grid-cols-2` mobile, `grid-cols-5` xl.

### `ShopCard`

Shop card for grid display.

Props:
```ts
interface ShopCardProps {
  shop: Shop;
}
```

Renders: logo, name, status badge, product count, description.

### `CategoryFilter` / `CategoryPill`

Horizontal scrollable category pills.

Props:
```ts
interface CategoryFilterProps {
  categories: Category[];
  selectedSlug?: string;
  className?: string;
}
```

### `PriceText`

Formats price in VND with orange color.

Props:
```ts
interface PriceTextProps {
  value: number;
  className?: string;
}
```

### `QuantityStepper`

+/- quantity selector with disabled state.

Props:
```ts
interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}
```

### `OrderStatusBadge`

Order status chip with color coding.

Props:
```ts
interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}
```

Status colors: pending/yellow, processing/blue, shipped/indigo, delivered/green, cancelled/red.

---

## Cart Components

### `CartShopGroup`

Cart section grouped by shop.

Props:
```ts
interface CartShopGroupProps {
  shopId: string;
  shopName?: string;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}
```

Features: shop header, item list with image/name/variant/qty/price, subtotal, remove button, quantity stepper.

---

## State Components

### `MarketplaceEmptyState`

Empty state with icon, title, description, optional action.

Props:
```ts
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}
```

### `MarketplaceErrorState`

Error state with retry button.

Props:
```ts
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}
```

### `MarketplaceLoadingState`

Skeleton loading grid.

Props:
```ts
interface LoadingStateProps {
  rows?: number;
  columns?: number; // 2, 3, 4, 5, 6
  className?: string;
}
```

---

## Barrel Export

All components exported from `my-app/components/marketplace/index.ts`:

```ts
export {
  MarketplaceHeader,
  MarketplaceFooter,
  MarketplaceEmptyState,
  MarketplaceErrorState,
  MarketplaceLoadingState,
  ProductCard,
  ProductGrid,
  ShopCard,
  CategoryPill,
  CategoryFilter,
  PriceText,
  QuantityStepper,
  CartShopGroup,
  OrderStatusBadge,
};
```
