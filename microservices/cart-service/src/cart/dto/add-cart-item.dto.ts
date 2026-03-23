import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class AddCartItemDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId: number;

  @IsString()
  @MaxLength(160)
  name: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}
