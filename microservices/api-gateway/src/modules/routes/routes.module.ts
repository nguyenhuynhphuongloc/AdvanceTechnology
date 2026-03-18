import { Module } from '@nestjs/common';
import { AuthController } from './v1/auth.controller';
import { 
  UserController, 
  ProductController, 
  AdminProductController,
  OrderController, 
  CartController, 
  InventoryController, 
  AdminInventoryController,
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
    OrderController,
    CartController,
    InventoryController,
    AdminInventoryController,
    PaymentController,
    NotificationController
  ],
})
export class RoutesModule {}
