import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsPositive, IsString, Max } from 'class-validator';

export class AdminProductQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['all', 'active', 'inactive'])
  status?: 'all' | 'active' | 'inactive' = 'all';

  // ─── Marketplace filters ────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  sellerId?: string;

  @IsOptional()
  @IsString()
  approvalStatus?: string;
}
