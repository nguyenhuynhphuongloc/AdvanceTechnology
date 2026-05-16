## Context

The repo now contains a split but uneven admin/backend landscape:

- `product-service` owns catalog metadata, categories, collections, images, and variants, and already exposes category and product admin routes.
- `inventory-service` owns stock and branches, and already exposes admin inventory search/update plus non-admin branch CRUD.
- `authentication-service` exposes admin user reads.
- `payment-service`, `notification-service`, and `cart-service` expose public or domain-local routes but not consistent admin-facing contracts.
- `logging-service` exists but is not yet wired into gateway-backed admin browsing.
- Store identity is still hardcoded in `my-app/lib/storefront/config.ts`, while Admin Store Settings is only a frontend preview with no persistence contract.

The change is cross-cutting because it must unify frontend admin modules, gateway route protection, and backend ownership without collapsing service boundaries. The primary constraint is to keep domain ownership coherent: catalog metadata cannot become stock ownership, and storefront identity should not be permanently embedded in frontend config.

## Goals / Non-Goals

**Goals:**
- Deliver a complete admin route set where each visible module is backed by a real API contract or an explicit domain owner.
- Make product management operationally complete, including media, variants, related products, and category linkage.
- Keep stock and branch data owned by `inventory-service` while surfacing them coherently inside admin product/inventory workflows.
- Standardize protected admin gateway routing, validation, and error handling for all admin modules.
- Persist store identity settings and propagate them to storefront header, footer, home, and related surfaces.
- Remove remaining hardcoded/mock admin and storefront data paths where a real backend source should exist.

**Non-Goals:**
- Merge domain services into a monolith or reassign product/inventory/payment ownership across services.
- Introduce a generic analytics platform or full BI system as part of the dashboard.
- Rebuild the customer storefront IA from scratch beyond branding/settings synchronization and API-backed data cleanup.
- Introduce refund, reconciliation, or advanced fulfillment workflows unless already supported by service ownership in this repo.

## Decisions

### Decision: Keep domain ownership strict across services

- `product-service`: products, categories, collections, media, variants, related products
- `inventory-service`: stock, reserved stock, branch CRUD, branch-aware availability
- `authentication-service`: admin session and user administration
- `order-service`: order visibility and lifecycle actions
- `payment-service`: payment transactions and payment state visibility
- `cart-service`: admin cart oversight
- `notification-service`: notification log/history
- `logging-service`: operational logs
- `store-service` (new): store identity and settings

Rationale:
- The repo already trends in this direction, especially after the product/inventory split.
- This avoids duplicating `stock` or branch state inside product management.

Alternatives considered:
- Put store settings into `product-service`: rejected because brand identity is broader than catalog.
- Put stock editing directly into `product-service`: rejected because it recreates dual source of truth with `inventory-service`.

### Decision: Introduce protected admin gateway paths for every admin module

The gateway should expose a consistent admin route family:

```text
/api/v1/admin/products
/api/v1/admin/categories
/api/v1/admin/inventory
/api/v1/admin/branches
/api/v1/admin/orders
/api/v1/admin/payments
/api/v1/admin/carts
/api/v1/admin/users
/api/v1/admin/store-settings
/api/v1/admin/notifications
/api/v1/admin/logs
```

All of these routes require admin-authenticated access at the gateway boundary before forwarding downstream.

Rationale:
- The frontend already centralizes admin access through `my-app/lib/admin/api.ts`.
- A uniform route family keeps authorization and debugging predictable.

Alternatives considered:
- Reuse mixed public/admin service-local paths from the frontend: rejected because it spreads auth assumptions and breaks admin boundary clarity.

### Decision: Model product variants as admin-managed catalog metadata with inventory joined separately

The admin product editor should own:
- create/update/delete variants
- variant `size`, `color`, `sku`, `priceOverride`
- variant image linkage

The editor may display inventory state, but stock mutation remains an inventory workflow keyed by `variantId` and `branchId`.

Rationale:
- Variant metadata belongs to the catalog contract.
- Inventory is operational state and must remain separate for accuracy.

Alternatives considered:
- Separate variant administration into a totally independent module first: rejected because the current product UI and payload model already treat variants as part of product editing.

### Decision: Create a dedicated store settings backend contract and use frontend config only as fallback

This change should introduce a persistent store settings resource with fields for:
- `storeName`
- `logoImageUrl`
- `logoPublicId`
- `description`
- `contactEmail`
- `contactPhone`
- `address`

The storefront reads backend settings first and falls back to `storefrontBranding` only when the store settings resource is unavailable.

Rationale:
- The existing admin Store Settings page is currently a dead-end preview.
- Brand/logo sync must not require code edits after admin changes.

Alternatives considered:
- Continue using frontend config and only expose an admin preview: rejected because it does not meet the admin persistence requirement.

### Decision: Make observability and support modules read-first, not mutation-first

For `payments`, `carts`, `notifications`, and `logs`, the first complete admin contract should prioritize:
- list view
- detail view
- filtering/search/pagination
- links to related entities

Mutations should only be added where the owning service already has a clear supported operation.

Rationale:
- Visibility closes more operational gaps than speculative write actions.
- It avoids inventing unsafe admin mutations for logs, payment records, or notification history.

Alternatives considered:
- Require every admin module to have mutation support immediately: rejected because some domains are observational by nature.

## Risks / Trade-offs

- [New `store-service` adds another deployable service] -> Mitigation: keep the initial contract narrow and settings-focused, with gateway-first integration and no extra cross-service coupling.
- [Admin product UI may overreach into inventory responsibilities] -> Mitigation: treat stock as read-through/jump-off data inside product workflows and keep inventory writes behind inventory APIs.
- [Gateway route expansion increases auth and proxy surface area] -> Mitigation: standardize admin route registration, reuse existing guards, and add route-level gateway tests.
- [Read-first admin modules may still feel incomplete to operators] -> Mitigation: define explicit related-resource links and next actions so support staff can navigate from dashboard to the owning workflow.
- [Storefront branding fallback can hide backend failures] -> Mitigation: use fallback only when settings are unavailable and surface admin-side error states clearly.

## Migration Plan

1. Add or formalize backend contracts per domain, starting with store settings, payments, carts, branches, notifications, and logs.
2. Extend API gateway admin routing and guard coverage for the full admin route matrix.
3. Refactor `my-app/lib/admin/api.ts` to wrap all supported admin domains through one authenticated client boundary.
4. Complete admin product and inventory surfaces with variant/media/category/branch-aware flows.
5. Replace unavailable admin modules with real read/write pages in dependency order: payments, carts, store settings, notifications, logs, branches.
6. Switch storefront branding consumers to backend-backed store settings with config fallback.
7. Run route, auth, and cross-module verification before removing any remaining placeholder states.

Rollback:
- Frontend modules can fall back to existing unavailable states if a backend admin contract is not deployable in time.
- Storefront branding can temporarily continue using `storefrontBranding` if store settings deployment is blocked.
- Domain ownership rollback must never reintroduce product-level stock as a workaround.

## Open Questions

- Whether `logging-service` should expose a queryable admin log API directly or whether gateway should aggregate logs from multiple services into one admin feed.
- Whether admin cart oversight should include guest carts as first-class searchable records or begin with user-linked carts only.
- Whether payment administration includes approved mutations beyond read visibility in the current business workflow.
- Whether branch selection should appear directly inside the product editor as inventory shortcuts or remain entirely inside inventory/branch modules.
