import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ShopOrder } from './entities/shop-order.entity';
import { ShopOrderItem } from './entities/shop-order-item.entity';
import { OrderEventEntity } from './entities/order-event.entity';
import { BuyerOrderController, SellerOrderController, AdminOrderController, AdminShopOrderController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, ShopOrder, ShopOrderItem, OrderEventEntity])],
  controllers: [BuyerOrderController, SellerOrderController, AdminOrderController, AdminShopOrderController],
  providers: [OrdersService],
})
export class OrdersModule {}
