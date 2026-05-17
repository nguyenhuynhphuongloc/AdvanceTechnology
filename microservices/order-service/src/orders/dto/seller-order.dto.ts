import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ShipOrderDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  shippingProvider?: string;
}

export class CancelOrderDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

export class AdminUpdateShopOrderStatusDto {
  @IsEnum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund_requested', 'refunded'])
  status: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
