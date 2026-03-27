import { Module } from '@nestjs/common';
import { AuthController } from './v1/auth.controller';
import { 
  UserController, 
  ProductController, 
  AdminProductController,
  AdminOrderController,
  OrderController, 
  CartController, 
  InventoryController, 
  AdminInventoryController,
  AdminUserController,
  PaymentController, 
  NotificationController 
} from './v1/routes.controller';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [
    AuthController,
    UserController,
    ProductController,
    AdminProductController,
    AdminOrderController,
    OrderController,
    CartController,
    InventoryController,
    AdminInventoryController,
    AdminUserController,
    PaymentController,
    NotificationController
  ],
})
export class RoutesModule {}
