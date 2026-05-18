export class UpsertInventoryItemDto {
  productId?: string;
  variantId: string;
  shopId?: string;
  branchId?: string;
  sku?: string;
  stock: number;
  lowStockThreshold?: number;
}
