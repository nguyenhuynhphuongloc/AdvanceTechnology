# Phase 5 — UI Components

## New Components

### AdminPageHeader

**File**: `my-app/components/admin/AdminPageHeader.tsx`

**Purpose**: Consistent page header for all admin pages with title, subtitle, description, and optional actions slot.

**Props**:
```typescript
{
  title: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
}
```

**Usage**: Wrap every admin page content with this header for consistent layout.

---

### AdminStatCard

**File**: `my-app/components/admin/AdminStatCard.tsx`

**Purpose**: Display a single metric with icon and optional trend indicator.

**Props**:
```typescript
{
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  loading?: boolean;
}
```

**Usage**: Used on analytics dashboard to display Total Orders, Revenue, Users, Products.

---

### AdminStatusBadge

**File**: `my-app/components/admin/AdminStatusBadge.tsx`

**Purpose**: Colored badge for consistent status display across all admin tables and detail views.

**Props**:
```typescript
{
  status: string;
  variant?: "pending" | "approved" | "active" | "rejected" | "suspended" | "inactive" | "info" | "default";
  showDot?: boolean;
  className?: string;
}
```

**Behavior**: Auto-derives variant from lowercase status string. Shows dot indicator by default.

---

### AdminEmptyState

**File**: `my-app/components/admin/AdminEmptyState.tsx`

**Purpose**: Empty state display for when tables/lists have no data, with optional CTA button.

**Props**:
```typescript
{
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}
```

**Usage**: Used on all list pages when no data, and on placeholder pages (sellers, refunds, commissions).

---

### AdminLoadingState

**File**: `my-app/components/admin/AdminLoadingState.tsx`

**Purpose**: Full-page or section loading indicator with spinner and optional label.

**Props**:
```typescript
{
  label?: string;
  className?: string;
}
```

**Usage**: Wraps data loading sections in all admin list/detail pages.

---

### AdminActionBar

**File**: `my-app/components/admin/AdminActionBar.tsx`

**Purpose**: Search + filter + action row for admin list pages.

**Props**:
```typescript
{
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}
```

**Usage**: Used on seller profiles page, product approvals page.

---

### AdminModal

**File**: `my-app/components/admin/AdminModal.tsx`

**Purpose**: Dialog-based modal wrapper with header, body, and optional footer.

**Props**:
```typescript
{
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}
```

**Behavior**: Uses native `<dialog>` element. Closes on Escape key or backdrop click. Max height 90vh.

---

### AdminConfirmDialog

**File**: `my-app/components/admin/AdminConfirmDialog.tsx`

**Purpose**: Pre-built confirm/cancel dialog for approve/reject/hide actions.

**Props**:
```typescript
{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info" | "default";
  loading?: boolean;
  children?: ReactNode;
}
```

**Usage**: Used on seller profiles page (approve/reject/suspend), shop approvals page, product approvals page.

---

## Updated Components

### AdminSessionGate

**File**: `my-app/components/admin/AdminSessionGate.tsx`

**Change**: Added `useAdminToken()` hook export alongside existing `useAdminSession()`.

**New Export**:
```typescript
export function useAdminToken(): string
```

**Purpose**: Returns just the token string for use in data fetching functions that need the token directly.

---

### AdminShell

**File**: `my-app/components/admin/AdminShell.tsx`

**Change**: Expanded `adminNavItems` array with new groups and nav items.

**New Nav Groups**:
- Overview (added Analytics)
- Users & Sellers (renamed from Customers, added Sellers, Seller Profiles)
- Moderation (Shop Approvals, Product Approvals)
- Finance (Refunds, Commissions)

**New Exports**: None.

---

## Component Usage Summary

| Component | Pages Using It |
|-----------|---------------|
| `AdminPageHeader` | All new admin pages |
| `AdminStatCard` | `/admin/analytics` |
| `AdminStatusBadge` | `/admin/seller-profiles`, `/admin/shop-approvals`, `/admin/product-approvals`, `/admin/users/[id]` |
| `AdminEmptyState` | `/admin/seller-profiles`, `/admin/shop-approvals`, `/admin/product-approvals`, `/admin/sellers`, `/admin/refunds`, `/admin/commissions`, `/admin/users/[id]` |
| `AdminLoadingState` | `/admin/seller-profiles`, `/admin/shop-approvals`, `/admin/product-approvals`, `/admin/analytics`, `/admin/users/[id]` |
| `AdminActionBar` | `/admin/seller-profiles`, `/admin/product-approvals` |
| `AdminModal` | `/admin/shop-approvals` (reject reason), `/admin/product-approvals` (reject reason) |
| `AdminConfirmDialog` | `/admin/seller-profiles`, `/admin/shop-approvals`, `/admin/product-approvals`, `/admin/users/[id]` |
