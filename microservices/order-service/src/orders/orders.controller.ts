import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(
    @Headers('x-user-id') userIdHeader: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(this.parseUserId(userIdHeader), dto, idempotencyKey);
  }

  @Get()
  listMyOrders(@Headers('x-user-id') userIdHeader: string | undefined) {
    return this.ordersService.listOrders(this.parseUserId(userIdHeader));
  }

  @Get(':orderId')
  getMyOrder(
    @Headers('x-user-id') userIdHeader: string | undefined,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.getOrderById(
      this.parseUserId(userIdHeader),
      this.parsePositiveInt(orderId, 'orderId'),
    );
  }

  @Patch(':orderId/cancel')
  cancelMyOrder(
    @Headers('x-user-id') userIdHeader: string | undefined,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.cancelOrder(
      this.parseUserId(userIdHeader),
      this.parsePositiveInt(orderId, 'orderId'),
    );
  }

  private parseUserId(userIdHeader?: string) {
    const userId = Number(userIdHeader);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('x-user-id header must be a positive integer');
    }
    return userId;
  }

  private parsePositiveInt(value: string, fieldName: string) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`${fieldName} must be a positive integer`);
    }
    return parsed;
  }
}
