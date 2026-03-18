import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsPositive, IsString, Max } from 'class-validator';

export class ProductListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(50)
  limit?: number = 12;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['latest', 'price-asc', 'price-desc', 'name-asc', 'name-desc'])
  sort?: 'latest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' = 'latest';
}
