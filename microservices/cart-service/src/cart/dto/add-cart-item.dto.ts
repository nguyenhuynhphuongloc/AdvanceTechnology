import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsString, MaxLength } from 'class-validator';

export class AddCartItemDto {
  @IsString()
  productId: string;

  @IsString()
  variantId: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}
