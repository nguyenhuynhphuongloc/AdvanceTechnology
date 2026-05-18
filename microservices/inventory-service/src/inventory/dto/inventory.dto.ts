import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Min, Max } from 'class-validator';

export class UpsertInventoryItemDto {
  productId?: string;
  variantId: string;
  branchId?: string;
  sku?: string;
  stock: number;
  lowStockThreshold?: number;
}

export class InventoryQueryDto {
  productId?: string;
  variantId?: string;
  sku?: string;
  branchId?: string;
  shopId?: string;
  lowStockOnly?: boolean;
}

export class UpdateInventoryQuantityDto {
  stock: number;
}

export class UpdateInventoryStockDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;
}

export class SellerInventoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  lowStockOnly?: boolean;

  @IsOptional()
  @IsString()
  productId?: string;
}

export class CreateInventoryItemDto {
  @IsString()
  productId: string;

  @IsString()
  variantId: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;
}
