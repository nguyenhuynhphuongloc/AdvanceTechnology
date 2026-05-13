import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  variantId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class CreateOrderDto {
  @IsString()
  paymentMethod: string;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsBoolean()
  simulatePaymentFailure?: boolean;

  @IsOptional()
  @IsBoolean()
  isGuest?: boolean;

  @IsOptional()
  @IsString()
  authUserId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
