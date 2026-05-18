# Phase 4B UI Components

All components live in `my-app/components/seller/`.

## SellerShell

**File**: `components/seller/SellerShell.tsx`
**Purpose**: Shared layout wrapper for seller pages (kept for reference, layout uses inline implementation)
**Props**:
- `children: React.ReactNode` — page content
- `shop?: Shop | null` — optional shop data for header

## SellerPageHeader

**File**: `components/seller/SellerPageHeader.tsx`
**Purpose**: Consistent page header with title, subtitle, optional back link, optional action button
**Props**:
```typescript
{
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}
```

## SellerStatCard

**File**: `components/seller/SellerStatCard.tsx`
**Purpose**: Dashboard stat card with icon, label, value, and accent color
**Props**:
```typescript
{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: 'default' | 'green' | 'red' | 'blue' | 'orange';
  subtitle?: string;
}
```

## SellerStatusBadge

**File**: `components/seller/SellerStatusBadge.tsx`
**Purpose**: Consistent status badge across shop, product, order, inventory modules
**Supported statuses**: approved, pending, rejected, suspended, draft, hidden, confirmed, processing, shipped, delivered, cancelled, in-stock, low-stock, out-of-stock, active, inactive
**Props**:
```typescript
{
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}
```

## SellerEmptyState

**File**: `components/seller/SellerEmptyState.tsx`
**Purpose**: Empty state with icon, title, description, optional action
**Props**:
```typescript
{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
```

## SellerLoadingState

**File**: `components/seller/SellerLoadingState.tsx`
**Purpose**: Centered loading spinner with optional message
**Props**:
```typescript
{
  message?: string; // default: "Loading..."
}
```

## SellerActionBar

**File**: `components/seller/SellerActionBar.tsx`
**Purpose**: Search input + filter buttons + action area for list pages
**Props**:
```typescript
{
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  };
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}
```

## SellerModal

**File**: `components/seller/SellerModal.tsx`
**Purpose**: Accessible modal dialog with backdrop, keyboard ESC close, click-outside close
**Props**:
```typescript
{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
```
