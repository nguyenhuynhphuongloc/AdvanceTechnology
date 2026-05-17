import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class OrderQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(['pending', 'awaiting_payment', 'paid', 'processing', 'partially_shipped', 'shipped', 'delivered', 'cancelled', 'refunded'])
  status?: string;

  @IsOptional()
  @IsEnum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
  paymentStatus?: string;
}

export class SellerOrderQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund_requested', 'refunded'])
  status?: string;
}

export class AdminOrderQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(['pending', 'awaiting_payment', 'paid', 'processing', 'partially_shipped', 'shipped', 'delivered', 'cancelled', 'refunded'])
  status?: string;

  @IsOptional()
  @IsUUID()
  buyerId?: string;

  @IsOptional()
  @IsEnum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
  paymentStatus?: string;
}

export class AdminShopOrderQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund_requested', 'refunded'])
  status?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;
}
