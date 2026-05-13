import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('api/v1/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(
    @Body() dto: CreateOrderDto,
    @Headers('x-user-id') userId?: string,
  ) {
    if (userId) {
      dto.authUserId = userId;
    }
    return this.orderService.createOrder(dto);
  }

  @Get('user/my-orders')
  getMyOrders(@Headers('x-user-id') userId: string) {
    return this.orderService.getUserOrders(userId);
  }

  @Post(':id/approve')
  approveOrder(@Param('id') id: string) {
    return this.orderService.approveOrder(id);
  }

  @Post(':id/deliver')
  deliverOrder(@Param('id') id: string) {
    return this.orderService.deliverOrder(id);
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }
}

@Controller('api/v1/admin/orders')
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  listOrders() {
    return this.orderService.listAdminOrders();
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.orderService.getAdminOrder(id);
  }
}
